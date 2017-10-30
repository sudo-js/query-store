import Emitable from './emitable';

export default class extends Emitable {
  // ### find
  // * Will choose either get, or getPath depending on the presence of a `.`
  find(str, data) {
    return ~str.indexOf('.') ? this.getPath(str, data) : this.get(str, data);
  }
  
  get(key, data=this.data) { return data[key]; }

  getPath(path, data=this.data) {
    let ary = path.split('.'), obj = data, key;

    for (; ary.length && (key = ary.shift());) {
      // end of the path
      if(!ary.length) return obj[key];
      // the path continues
      else {
        obj = obj[key];
        // fast fail if there is no val there
        if(!obj) break;
      }
    }
    return obj;
  }

  // ### gets
  // * Assemble and return an array of values for each key
  // (or path) contained in the passed in array.
  // * `param` {array} `ary`. An array of keys.
  // * `returns` {object}
  gets(ary, data) {
    let ret = [];

    for (let i = 0; i < ary.length; i++) ret.push(this.find(ary[i], data));

    return ret;
  }
  
  // ### put
  // * Will choose either set, or setPath depending on the presence of a `.`
  put(str, val, data) {
    ~str.indexOf('.') ? this.setPath(str, val, data) : this.set(str, val, data);
  }
  
  // ### remove
  // * Will choose either unset, or unsetPath depending on the presence of a `.`
  remove(str, data) {
    str.indexOf('.') ? this.unsetPath(str, data) : this.unset(str, data);
  }

  set(key, val, data=this.data) { data[key] = val; }

  setPath(path, val, data=this.data) {
    let ary = path.split('.'), obj = data, key;

    for (; ary.length && (key = ary.shift());) {
      if(!ary.length) obj[key] = val;
      // move down one refinement if there
      else if (key in obj) obj = obj[key];
      // if not there, create it
      else obj = obj[key] = {};
    }
  }

  // ### sets
  // * Invokes `set()` or `setPath()` for each key value pair in `obj`.
  // * `param` {Object} `obj`. The keys and values to set.
  sets(obj, data) {
    for (let [key, val] of Object.entries(obj)) {
      this.put(key, val, data);
    }
  }

  unset(key, data=this.data) { delete data[key]; }

  // ### unsetPath
  // Remove a key:value pair from this object's data store located at `path`
  // `param` {String} `path`
  // `param` {Object} `obj` The object to operate on.
  unsetPath(path, data=this.data) {
    var p = path.split('.'), obj = data, key;

    for (; p.length && (key = p.shift());) {
      if(!obj) break;
      if(!p.length) delete obj[key];
      else obj = obj[key];
    }
  }

  // ### unsets
  // Deletes a number of keys or paths from this object's data store
  //
  // `param` {array} `ary`. An array of keys or paths.
  unsets(ary, data=this.data) {
    for (let i = 0; i < ary.length; i++) this.remove(ary[i], data);
  }
}