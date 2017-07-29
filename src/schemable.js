import Pathable from './pathable';

export default class extends Pathable {
  constructor(data) {
    super(data);

    this.schemas = [];
  }
  // ### hydrateMap
  // * __NOTES__: I would use a weakMap if keys could be strings. Using a Map is
  // a possibility but, not sure we need it
  // * `param` {object} `map`. The current map to hydrate
  // * `param` {string} `key`. The key (or path) from the top level of data([i])
  // * `param` {string||array} `term`. The key (or path) from data([i])[key] or an array of them
  hydrateMap(map, key, term) {
    // targets are the hashes of data that contain our terms which will be returned in a query operation
    const find = (k, d) => { return ~k.indexOf('.') ? this.getPath(k, d) : this.get(k, d); };

    const add = (v, i) => {
      if(Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          return add(v[j], i);
        }
      }

      let data = typeof(i) === 'number' ? this.data[i] : this.data;
      // __NOTE:__ can use `in` safely here as we created it with no proto
      if(v in map) {
        // dont push a ref in more than once
        !~map[v].indexOf(data) && map[v].push(data);
      } else map[v] = [data];
    };

    function hydrate(t, c, i) {
      let val;
      // term can be an array of terms
      if(Array.isArray(t)) {
        for (let k = 0; k < t.length; k++) {
          val = find(t[k], c);
          val && add(val, i);
        }
      } else {
        val = find(t, c);
        val && add(val, i);
      }
    }

    function iterate(t, c, i) {
      // c may be an array...
      if(Array.isArray(c)) {
        for (let l = 0; l < c.length; l++) {
          hydrate(t, c[l], i);
        }

      } else hydrate(t, c, i);
    }

    let curr;
    // our data is either an Array or an object (if json should have been parsed first)
    if(Array.isArray(this.data)) {
      for (let i = 0; i < this.data.length; i++) {
        curr = find(key, this.data[i]);
        // if its not in this one, move along...
        if(!curr) continue;
        iterate(term, curr, i);
      }
    } else { // non-array data
      curr = find(key, this.data);
      curr && iterate(term, curr);
    }
  }
  // ### map
  // * Given a schema, create our mappings to make the data actually useable
  // * `param` {object} `schema`
  //
  // __NOTE__: we can prob, in the future, think about insertion order...
  map(schema, remap, unmap) {
    // push the schema into our schema array in case we need to re-map it (ony if mapping)
    !remap && !unmap && this.schemas.push(schema);
    // create the map with no proto via create-null
    const make = (name) => { if(!(this.hasOwnProperty(name))) this[name] = Object.create(null);};
    // for each of the keys in the schema, create values-as-keys in our map
    // which we will use to facilitate query-ing
    for(let [key, val] of Object.entries(schema)) {
      // the val is always an array, iterate them and act accordingly...
      for (let i = 0; i < val.length; i++) {
        if(typeof val[i] === 'string') {
          // if unmapping clear, if remapping clear the first time thru
          if(unmap) {
            delete this[key];
            continue;
          } else if(remap && i === 0) delete this[key];
          make(key);
          this.hydrateMap(this[key], key, val[i]);
        } else {
          // as takes precedence, fall back to key
          let as = val[i].as || val[i].key;
          // same as the string case, assure the map exists (and clear on 0th if remapping)
          if(unmap) {
            delete this[as];
            continue;
          } else if(remap && i === 0) delete this[as];
          make(as);
          // if there are `keys` pass them as is, hydrate will find them, note that
          // `key` should be a path in `keys` cases...
          if(val[i].hasOwnProperty('keys')) this.hydrateMap(this[as], `${key}.${val[i].key}`, val[i].keys);
          else this.hydrateMap(this[as], key, val[i].key);
        }
      }
    }
    // return the index at which this schema exists in our schema list so the consumer can unmap
    return !remap && this.schemas.length - 1;
  }

  // ### remap
  // * The store may decide to remap schemas after some action (like an update)
  remap() {
    for (let i = 0; i < this.schemas.length; i++) {
      // optional bool signals that this is a remap operation
      this.map(this.schemas[i], true);
    }
  }

  unmap(...args) {
    for(let index of Object.values(args)) {
      let schema = this.schemas.splice(index, 1);
      Array.isArray(schema) && this.map(schema[0], null, true);
    }
  }
}