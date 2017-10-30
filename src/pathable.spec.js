const Pathable = require('./pathable').default;

describe('Pathable base class', function() {
  beforeEach(function() {
    // start with empty data hash
    this.store = new Pathable();
  });
  
  it('can set (and get) a key', function() {
    expect(this.store.get('foo')).toBeUndefined();
    this.store.set('foo', 'bar');
    expect(this.store.get('foo')).toBe('bar');
  });
  
  it('can get a key via find', function() {
    expect(this.store.get('bar')).toBeUndefined();
    this.store.set('bar', 'baz');
    expect(this.store.find('bar')).toBe('baz');
  });
  
  it('does not alter the internal data hash with get(s)', function() {
    let s = new Pathable({foo: {bar: 'baz', spam: {eggs: 'vikings'}}});
    expect(s.getPath('foo.spam.eggs')).toBe('vikings');
    expect(s.get('foo')).toEqual({bar: 'baz', spam: {eggs: 'vikings'}});
  });
  
  it('can set/get key-paths', function() {
    expect(this.store.getPath('a.b.c')).toBeUndefined();
    this.store.set('a', {stuff: 'some a stuff'});
    expect(this.store.get('a')).toEqual({stuff: 'some a stuff'});
    this.store.setPath('a.b', {stuff: 'some b stuff'});
    expect(this.store.get('a')).toEqual({stuff: 'some a stuff', b: {stuff: 'some b stuff'}});
    expect(this.store.getPath('a.b')).toEqual({stuff: 'some b stuff'});
  });
  
  it('can set/get key-paths via find and put', function() {
    expect(this.store.find('b.c.d')).toBeUndefined();
    this.store.put('b', {stuff: 'some b stuff'});
    expect(this.store.find('b')).toEqual({stuff: 'some b stuff'});
    this.store.put('b.c', {stuff: 'some c stuff'});
    expect(this.store.find('b')).toEqual({stuff: 'some b stuff', c: {stuff: 'some c stuff'}});
    expect(this.store.find('b.c')).toEqual({stuff: 'some c stuff'});
  });
  
  it('can get multiple keys/paths with gets', function() {
    this.store.sets({
      foo: 'bar',
      spam: {eggs: {vikings: true}}
    });
    expect(this.store.gets(['foo', 'spam.eggs'])).toEqual(['bar', {vikings: true}]);
  });
  
  it('will delete a key', function() {
    this.store.sets({foo: 'bar', spam: 'eggs'});
    this.store.unset('foo');
    expect(this.store.data).toEqual({spam: 'eggs'});
  });
  
  it('will delete a key path', function() {
    this.store.setPath('foo.bar.spam', {eggs: true, vikings: true});
    this.store.unsetPath('foo.bar.spam.eggs');
    expect(this.store.data).toEqual({foo: {bar: {spam: {vikings: true}}}});
  });
  
  it('can delete multiple keys/paths with unsets', function() {
    this.store.sets({foo: 'bar', baz: {spam: 'eggs'}});
    this.store.unsets(['foo', 'baz.spam']);
    expect(this.store.data).toEqual({baz:{}});
  });
  
  describe('data as array', function() {
    beforeEach(function() {
      this.store.data = [
        {
          foo: 'bar',
          baz: 1234,
          spam: {
            eggs: true,
            vikings: false,
            lumberjack: {
              ok: true,
              sleepsAllNight: 'worksAllDay',
              putsOnWomensClothing: 'hangsAroundInBars'
            }
          }
        },
        {
          foo: 'baz',
          baz: 5678,
          spam: {
            eggs: false,
            vikings: true,
            lumberjack: {
              ok: false,
              sleepsAllNight: 'worksAllDay'
            }
          }
        }
      ];
    });
    
    it('can set (and get) a key given a data object', function() {
      expect(this.store.get('foo', this.store.data[0])).toBe('bar');
      expect(this.store.get('qux', this.store.data[0])).toBeUndefined();
      this.store.set('qux', 'arthur', this.store.data[0]);
      expect(this.store.get('qux', this.store.data[0])).toBe('arthur');
      
      expect(this.store.get('king', this.store.data[1])).toBeUndefined();
      this.store.set('king', 'britians', this.store.data[1]);
      expect(this.store.get('king', this.store.data[1])).toBe('britians');
    });
    
    it('can set/get key-paths', function() {
      expect(this.store.getPath('spam.eggs', this.store.data[0])).toBe(true);
      expect(this.store.getPath('spam.eggs', this.store.data[1])).toBe(false);
      
      this.store.setPath('spam.sausage.bacon', true, this.store.data[0]);
      expect(this.store.getPath('spam.sausage', this.store.data[0])).toEqual({bacon: true});
    });
    
    it('can get multiple keys/paths with gets', function() {
      expect(this.store.gets(['foo', 'spam.lumberjack.putsOnWomensClothing'], this.store.data[0])).toEqual(['bar', 'hangsAroundInBars']);
      expect(this.store.gets(['baz', 'spam.lumberjack.ok'], this.store.data[1])).toEqual([5678, false]);
    });
  });
});