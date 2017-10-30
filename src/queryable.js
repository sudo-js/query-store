import Schemable from './schemable';

export default class extends Schemable {
  constructor(data) {
    super(data);
    // an iterable that guarantees unique entries. we will clear it on each query.
    // __NOTE__: technically, it is cleared in `from`...
    this.dataset = new Set;
  }
  // ### filter
  filter(keys) {
    const found = [];
    const filters = keys.split(',');

    if(!this.dataset) return;

    for (let item of this.dataset) {
      for (let i = 0; i < filters.length; i++) {
        found.push(this.find(filters[i], item));
      }
    }
    return this.unwrap(found);
  }

  // ### from
  from(key, noFilter) {
    if(!this.terms) return;

    // any call to from resets the dataset
    this.dataset.clear();

    for (let i = 0; i < this.terms.length; i++) {
      // unwrap as you go...
      if(this.terms[i] in this[key]) {
        let val = this.unwrap(this[key][this.terms[i]]);
        if(Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            this.dataset.add(val[i]);
          }
        } else this.dataset.add(val);
      }
    }

    // un-wrap the dataset if not filtering && only a length of 1 - note that minus any filtering we return an array
    return noFilter ? Array.from(this.dataset) : this;
  }

  // ### query
  query(term) {
    this.terms = term.split(',');
    return this;
  }

  // ### unwrap
  unwrap(ary) { return ary.length === 1 ? ary[0] : ary; }
}