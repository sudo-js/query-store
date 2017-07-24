const Emitable = require('./emitable').default;

describe('Emitable base class', function() {
  beforeEach(function() {
    this.store = new Emitable;
    this.observer = { handleEmit: function() {} };
  });

  it('exists', function() {
    expect(this.store).toBeTruthy();
    expect(Array.isArray(this.store.observers)).toBe(true);
  });

  it('can register an observer and remove it', function() {
    expect(this.store.observers.length).toBe(0);

    this.store.observe(this.observer.handleEmit);

    expect(this.store.observers.length).toBe(1);

    this.store.unobserve(this.observer.handleEmit);

    expect(this.store.observers.length).toBe(0);
  });

  it('will call observers when ready (but not removed ones)', function() {
    const observer = { handleEmit: function() {} };

    const obSpy1 = spyOn(this.observer, 'handleEmit');
    const obSpy2 = spyOn(observer, 'handleEmit');

    this.store.observe(this.observer.handleEmit);
    this.store.observe(observer.handleEmit);

    this.store.emit();

    expect(obSpy1).toHaveBeenCalled();
    expect(obSpy2).toHaveBeenCalled();

    this.store.unobserve(this.observer.handleEmit);

    this.store.emit();

    expect(obSpy2.calls.count()).toBe(2);
    expect(obSpy1.calls.count()).toBe(1);
  });
});