const Schemable = require('./schemable').default;
const json = require('./json/twitter').default;

describe('schemable child class', function() {

  it('exists as a pathable subclass', function() {
    const store = new Schemable;
    expect(store).toBeTruthy();
    expect(store instanceof Schemable).toBe(true);
    expect(typeof store.getPath).toBe('function');
  });

  describe('data as array (twitter ex)', function() {
    beforeEach(function() {
      this.store = new Schemable(json);
    });

    it('has initialized', function() {
      expect(this.store).toBeTruthy();
      expect(Array.isArray(this.store.data)).toBe(true);
    });

    it('can map a top level key', function() {
      expect(this.store.user).toBeUndefined();
      this.store.map({ user: ['name', 'screen_name'] });
      expect(this.store.user).toBeDefined();
      // has keys representing the vals found from the schema
      expect('twitterapi' in this.store.user).toBe(true);
      // both tweets have it, so both should be 'pointed' at
      expect(Array.isArray(this.store.user.twitterapi)).toBe(true);
      expect(this.store.user.twitterapi.length).toBe(2);
      expect(this.store.user.twitterapi).toEqual([this.store.data[0], this.store.data[1]]);
      expect('Twitter API' in this.store.user).toBe(true);
      expect(Array.isArray(this.store.user['Twitter API'])).toBe(true);
      expect(this.store.user['Twitter API'].length).toBe(2);
      expect(this.store.user['Twitter API']).toEqual([this.store.data[0], this.store.data[1]]);
    });

    it('will setup query with a more complex schema (using as)', function() {
      expect(this.store.hashtags).toBeUndefined();
      // hoist hastags up to map level
      this.store.map({entities: [{key: 'hashtags', as: 'hashtags'}]});
      expect(this.store.hashtags).toBeDefined();
      // inspect the hashtags map
    });

    it('correctly sets up from a schema with "keys (note map name)"', function() {
      expect(this.store.nameDrops).toBeUndefined();
      this.store.map({entities: [{key: 'user_mentions', keys: ['name', 'screen_name'], as: 'nameDrops'}]});
      expect(this.store.nameDrops).toBeDefined();
      expect(Object.keys(this.store.nameDrops).length).toBe(3);
      // assure we dont push dupe refs in
      expect(this.store.nameDrops['TwitterDev'].length).toBe(1);
      expect(this.store.nameDrops['TwitterMktg'].length).toBe(1);
      expect(this.store.nameDrops['Twitter Marketing'].length).toBe(1);
    });
  });

});