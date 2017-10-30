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
    const isAry = Array.isArray(this.data);
    // our data is either an Array or an object with an indicated 'root' (via the term or default to key)
    const ary = isAry ? this.data : this.find(key);
    // TODO throw here if no ary?
    
    const add = (v, i) => {
      if(Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          add(v[j], i);
        }
      } else {
        let data = ary[i];
        // __NOTE:__ can use `in` safely here as we created it with no proto
        if(v in map) {
          // dont push a ref in more than once
          !~map[v].indexOf(data) && map[v].push(data);
        } else map[v] = [data];
      }
    };

    const hydrate = (t, c, i) => {
      let val;
      // term can be an array of terms
      if(Array.isArray(t)) {
        for (let k = 0; k < t.length; k++) {
          val = this.find(t[k], c);
          val && add(val, i);
        }
      } else {
        val = this.find(t, c);
        val && add(val, i);
      }
    };

    function iterate(t, c, i) {
      // c may be an array...
      if(Array.isArray(c)) {
        for (let l = 0; l < c.length; l++) {
          hydrate(t, c[l], i);
        }

      } else hydrate(t, c, i);
    }

    let curr;
    
    for (let i = 0; i < ary.length; i++) {
      // in the data-is-array case find the curr @i, otherwise no need to find it...
      curr = isAry ? this.find(key, ary[i]) : ary[i];
      // if its not in this one, move along...
      if(!curr) continue;
      iterate(term, curr, i);
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
    const make = name => { if(!(this.hasOwnProperty(name))) this[name] = Object.create(null);};
    // the operation to perform on the actual schema...
    const parse = (key, val, i) => {
      if(typeof val === 'string') {
        // if unmapping clear, if remapping clear the first time thru
        if(unmap) {
          delete this[key];
          return;
        } else if(remap && i === 0) delete this[key];
        
        make(key);
        this.hydrateMap(this[key], key, val);
        
      } else {
        // as takes precedence, fall back to key
        let as = val.as || val.key;
        // same as the string case, assure the map exists (and clear on 0th if remapping)
        if(unmap) {
          delete this[as];
          return;
        } else if(remap && i === 0) delete this[as];
        make(as);
        // if there are `keys` pass them as is, hydrate will find them, note that
        // `key` and `val.key` are formed into a path in the `keys` case...
        if(val.hasOwnProperty('keys')) this.hydrateMap(this[as], `${key}.${val.key}`, val.keys);
        else this.hydrateMap(this[as], key, val.key);
      }
    };
    // for each of the keys in the schema, create values-as-keys in our map
    // which we will use to facilitate query-ing
    for(let [key, val] of Object.entries(schema)) {
      // the val may be an array...
      if(Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) parse(key, val[i], i);
      
      } else parse(key, val, 0); // passing 0 is a flag to clear for remapping
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