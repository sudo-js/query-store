// Base class of the query store, provides a simplified event-emitter type
// interface. Consumers call `observe`, passing a callback function that will be
// invoked by the store when it chooses via 'emit'. There is no name for this emission as
// all observers are invoked and no args are passed.

export default class {
  constructor(data={}) {
    this.data = data;
    // could be a set, but why?
    this.observers = [];
  }

  emit() {
    for (let i = 0; i < this.observers.length; i++) {
      this.observers[i].call(null);
    }
  }

  init(data) {
    if(data) this.data = data;
  }

  observe(fn) {
    this.observers.push(fn);
  }

  unobserve(fn) {
    const idx = this.observers.indexOf(fn);
    if(~idx) this.observers.splice(idx, 1);
  }
}