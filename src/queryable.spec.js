const Queryable = require('./queryable').default;
const json = require('./json/twitter').default;

describe('queryable child class', function() {

  it('exists as a queryable subclass', function() {
    const store = new Queryable;
    expect(store).toBeTruthy();
    expect(store instanceof Queryable).toBe(true);
    expect(typeof store.query).toBe('function');
  });

  describe('data as array (twitter ex)', function() {
    beforeEach(function() {
      this.store = new Queryable(json);
    });

    afterEach(function() {
      this.store.dataset.clear();
    });

    it('will query with a simple schema', function() {
      expect(this.store.terms).toBeUndefined();
      // the current (unfiltered) data set is ref'd
      expect(this.store.dataset.size).toBe(0);
      this.store.map({ user: ['name', 'screen_name'] });
      // passing the optional bool signals no filtering (returns array via spread)
      expect(this.store.query('twitterapi').from('user', true)).toEqual([this.store.data[0], this.store.data[1]]);
      // the current query terms are ref'd
      expect(this.store.terms).toBeDefined();
    });

    it('can filter the returned data', function() {
      this.store.map({ user: ['name', 'screen_name'] });
      expect(this.store.query('twitterapi').from('user').filter('retweet_count')).toEqual([284, 111]);
    });

    it('will query with a more complex schema (using as)', function() {
      // hoist hastags up to map level
      this.store.map({entities: [{key: 'hashtags', as: 'hashtags'}]});
      expect(this.store.query('#PSA').from('hashtags').filter('text')).toBe('RT @TwitterDev: 1/ Today we’re sharing our vision for the future of the Twitter API platform!\nhttps://t.co/XweGngmxlP');
    });

    it('correctly sets up and queries from a schema with "keys (note map name)"', function() {
      this.store.map({entities: [{key: 'user_mentions', keys: ['name', 'screen_name'], as: 'nameDrops'}]});
      expect(this.store.query('TwitterDev').from('nameDrops').filter('id')).toBe(850007368138018817);
      expect(this.store.query('Twitter Marketing').from('nameDrops').filter('id')).toBe(848930551989915648);
      expect(this.store.query('TwitterMktg,TwitterDev').from('nameDrops').filter('id', true)).toEqual([848930551989915648, 850007368138018817]);
    });
  });

});