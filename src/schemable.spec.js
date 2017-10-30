const Schemable = require('./schemable').default;
const twitterJson = require('./json/twitter').default;
const userJson = require('./json/black_knight').default;

describe('schemable child class', function() {

  it('exists as a pathable subclass', function() {
    const store = new Schemable;
    expect(store).toBeTruthy();
    expect(store instanceof Schemable).toBe(true);
    expect(typeof store.getPath).toBe('function');
  });

  describe('data as array (twitter ex)', function() {
    beforeEach(function() {
      this.store = new Schemable(twitterJson);
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

    it('can remap a top level key', function() {
      this.store.map({ user: ['name', 'screen_name'] });
      expect(this.store.user.twitterapi).toEqual([this.store.data[0], this.store.data[1]]);
      expect(this.store.user['Twitter API']).toEqual([this.store.data[0], this.store.data[1]]);

      // change one of the underlying data
      this.store.setPath('user.name', 'Not Twitter API', this.store.data[0]);
      this.store.remap();

      expect(this.store.user.twitterapi).toEqual([this.store.data[0], this.store.data[1]]);
      expect(this.store.user['Twitter API']).toEqual([this.store.data[1]]);
      expect(this.store.user['Twitter API'].length).toBe(1);
      expect(this.store.user['Not Twitter API'].length).toBe(1);
      expect(this.store.user['Not Twitter API']).toEqual([this.store.data[0]]);

      // put it back
      this.store.setPath('user.name', 'Twitter API', this.store.data[0]);
    });

    it('can unmap a top level key', function() {
      expect(this.store.schemas.length).toBe(0);
      expect(this.store.user).toBeUndefined();
      const myMap = this.store.map({ user: ['name', 'screen_name'] });
      expect(myMap).toBe(0);
      expect(this.store.schemas.length).toBe(1);
      expect(this.store.user).toBeDefined();
      expect(this.store.user.twitterapi).toEqual([this.store.data[0], this.store.data[1]]);
      expect(this.store.user['Twitter API']).toEqual([this.store.data[0], this.store.data[1]]);
      this.store.unmap(myMap);
      expect(this.store.user).toBeUndefined();
      expect(this.store.schemas.length).toBe(0);
    });

    it('will setup query with a more complex schema (using as)', function() {
      expect(this.store.hashtags).toBeUndefined();
      // hoist hastags up to map level
      this.store.map({entities: {key: 'hashtags', as: 'hashtags'}});
      expect(this.store.hashtags).toBeDefined();
      // inspect the hashtags, there should be 3
      expect(Object.keys(this.store.hashtags).length).toBe(3);
    });

    it('correctly sets up from a schema with "keys (note map name)"', function() {
      expect(this.store.nameDrops).toBeUndefined();
      this.store.map({entities: {key: 'user_mentions', keys: ['name', 'screen_name'], as: 'nameDrops'}});
      expect(this.store.nameDrops).toBeDefined();
      expect(Object.keys(this.store.nameDrops).length).toBe(3);
      // assure we dont push dupe refs in
      expect(this.store.nameDrops['TwitterDev'].length).toBe(1);
      expect(this.store.nameDrops['TwitterMktg'].length).toBe(1);
      expect(this.store.nameDrops['Twitter Marketing'].length).toBe(1);
    });
  });

  describe('data as an object (begin empty)', function() {
    beforeEach(function() {
      this.store = new Schemable;
      
      this.store.init(userJson);
    });

    it('maps to a path, pointing to `key` as there is no `keys`', function() {
      this.store.map({'garments.tees': {key: 'tags', as: 'tees'}});
      expect(Object.keys(this.store.tees).length).toBe(4);
      // should be 2 black tees
      expect(this.store.tees.black).toBeDefined();
      // if fails because of non-ordered, just use typeof number...
      expect(this.store.tees.black[0].id).toBe(4);
      expect(this.store.tees.black[1].id).toBe(5);
      expect(this.store.tees['very dark grey'][0].id).toBe(6);
    });
    
    it('maps an entry, pointing to key + val.key as `keys` is present', function() {
      // specifying the root shortcuts a find operation...
      this.store.map({garments: {key: 'armors', keys: 'tags', as: 'armors'}});
      expect(this.store.armors).toBeDefined();
      // there is only one fluted armor
      expect(this.store.armors.fluted[0].id).toBe(14);
    });

  });
});