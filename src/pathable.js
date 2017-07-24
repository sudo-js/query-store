import Emitable from './emitable';

export default class extends Emitable {
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

    for (let i = 0; i < ary.length; i++) {
      ret.push(~ary[i].indexOf('.') ? this.getPath(ary[i], data) : this.get(ary[i], data));
    }

    return ret;
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
      ~key.indexOf('.') ? this.setPath(key, val, data) : this.set(key, val, data);
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
  unsets(ary, data) {
    for (let i = 0; i < ary.length; i++) {
      ~ary[i].indexOf('.') ? this.unsetPath(ary[i], data) : this.unset(ary[i], data);
    }
  }
}