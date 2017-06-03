'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      Review = require('../models/review'),
      User = require('../models/user'),
      Distillery = require('../models/distillery'),
      Region = require('../models/region'),
      DrinkType = require('../models/drink-type'),
      Rarity = require('../models/rarity');

describe('Review model', () => {

  var ids = [],
      userIds = [],
      distilleryIds = [],
      regionIds = [],
      drinkTypeIds = [],
      rarityIds = [];

  before(function (done) {
    User.create({ name: 'Test User', username: 'testuser', password: 'abcdef', access_level: 1 })
    .then(data => {
      userIds.push(data.id);
      return Distillery.create({ name: 'Test Distillery', city: 'Bardstown', state: 'Kentucky' });
    })
    .then(data => {
      distilleryIds.push(data.id);
      return Region.create({ name: 'United States: Kentucky', filter_name: 'Kentucky', sort_order: 20 });
    })
    .then(data => {
      regionIds.push(data.id);
      return DrinkType.create({ singular: 'Bourbon', plural: 'bourbons' });
    })
    .then(data => {
      drinkTypeIds.push(data.id);
      return Rarity.create({ name: 'Common', filter_name: 'easy-to-find', sort_order: 10 });
    })
    .then(data => {
      rarityIds.push(data.id);
      done();
    })
    .catch(e => {
      console.error(e)
      done();
    });
  });

  after(function (done) {
    Promise.all(ids.map(id => Review.delete(id)))
      .then(() => Promise.all(userIds.map(id => User.delete(id))))
      .then(() => Promise.all(distilleryIds.map(id => Distillery.delete(id))))
      .then(() => Promise.all(regionIds.map(id => Region.delete(id))))
      .then(() => Promise.all(drinkTypeIds.map(id => DrinkType.delete(id))))
      .then(() => Promise.all(rarityIds.map(id => Rarity.delete(id))))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates Review titles and subtitles', function () {
    expect(Review.validate({ title: 'Title' }).result).to.be.true;
    expect(Review.validate({ subtitle: 'Sübtitle' }).result).to.be.true;
    expect(Review.validate({ title: '' }).result).to.be.false;
    expect(Review.validate({ subtitle: 4 }).result).to.be.false;
    expect(Review.validate({ title: ['Title'] }).result).to.be.false;
  });

  it('Validates Review slugs', function () {
    expect(Review.validate({ slug: 'title' }).result).to.be.true;
    expect(Review.validate({ slug: 'dash-delimited-title' }).result).to.be.true;
    expect(Review.validate({ slug: 'space delimited title' }).result).to.be.false;
    expect(Review.validate({ slug: '0-leading-number' }).result).to.be.false;
    expect(Review.validate({ slug: 'Sübtitle' }).result).to.be.false;
    expect(Review.validate({ slug: '' }).result).to.be.false;
    expect(Review.validate({ slug: 4 }).result).to.be.false;
    expect(Review.validate({ slug: ['title'] }).result).to.be.false;
  });

  it('Validates Review publish dates', function () {
    expect(Review.validate({ published_at: new Date() }).result).to.be.true;
    expect(Review.validate({ published_at: 1496186149957 }).result).to.be.false;
    expect(Review.validate({ published_at: '2017-05-30T00:00:00Z' }).result).to.be.false;
    expect(Review.validate({ published_at: {} }).result).to.be.false;
    expect(Review.validate({ published_at: after }).result).to.be.false;
  });

  it('Validates Review foreign keys', function () {
    expect(Review.validate({ author: 4 }).result).to.be.true;
    expect(Review.validate({ author: 'Tim' }).result).to.be.false;
    expect(Review.validate({ distillery: -1 }).result).to.be.false;
    expect(Review.validate({ region: 5.45 }).result).to.be.false;
    expect(Review.validate({ drink_type: after }).result).to.be.false;
    expect(Review.validate({ rarity: 4.9 }).result).to.be.false;
  });

  it('Validates Review long text fields', function () {
    expect(Review.validate({ body: 'Hi' }).result).to.be.true;
    expect(Review.validate({ summary: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }).result).to.be.true;
    expect(Review.validate({ body: '' }).result).to.be.false;
    expect(Review.validate({ summary: true }).result).to.be.false;
  });

  it('Validates Review numerical fields', function () {
    expect(Review.validate({ proof: 80 }).result).to.be.true;
    expect(Review.validate({ proof: 138.2 }).result).to.be.true;
    expect(Review.validate({ proof: 201 }).result).to.be.false;
    expect(Review.validate({ proof: -4 }).result).to.be.false;
    expect(Review.validate({ proof: '96' }).result).to.be.false;
    expect(Review.validate({ age: 25 }).result).to.be.true;
    expect(Review.validate({ age: 0.5 }).result).to.be.true;
    expect(Review.validate({ age: -4 }).result).to.be.false;
    expect(Review.validate({ age: 'really old' }).result).to.be.false;
    expect(Review.validate({ manufacturer_price: 40 }).result).to.be.true;
    expect(Review.validate({ manufacturer_price: 29.95 }).result).to.be.true;
    expect(Review.validate({ manufacturer_price: -5 }).result).to.be.false;
    expect(Review.validate({ manufacturer_price: '$120' }).result).to.be.false;
    expect(Review.validate({ rating: 80 }).result).to.be.true;
    expect(Review.validate({ rating: 100.4 }).result).to.be.true;
    expect(Review.validate({ rating: -20 }).result).to.be.true;
    expect(Review.validate({ rating: "50" }).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            title: 'Title!',
            subtitle: 'Subtitle!',
            author: userIds[0],
            summary: 'Summary!',
            body: 'Body!'
          },
          badData = {
            title: 'Title!',
            body: 'Body!'
          },
          requiredFields = ['title', 'author', 'body'];
    expect(Review.validate(goodData, requiredFields).result).to.be.true;
    expect(Review.validate(badData, requiredFields).result).to.be.false;
  });

  it('Stores a complete Review', function () {
    return Review.create({
        title: 'Elijah Craig',
        subtitle: 'Small Batch Bourbon',
        slug: 'elijah-craig-small-batch',
        published_at: new Date('2014-01-01'),
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic review.',
        distillery: distilleryIds[0],
        region: regionIds[0],
        drink_type: drinkTypeIds[0],
        rarity: rarityIds[0],
        proof: 94,
        manufacturer_price: 30,
        mashbill_description: 'Bourbon',
        mashbill_recipe: '75% corn, 13% rye, 12% barley',
        rating: 72
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        ids.push(data.id);
        expect(data.title).to.equal('Elijah Craig');
        expect(data.subtitle).to.equal('Small Batch Bourbon');
        expect(data.slug).to.equal('elijah-craig-small-batch');
        expect(data.published_at).to.be.a('date');
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic review.');
        expect(data.proof).to.equal(94);
        expect(data.manufacturer_price).to.equal(30);
        expect(data.mashbill_description).to.equal('Bourbon');
        expect(data.mashbill_recipe).to.equal('75% corn, 13% rye, 12% barley');
        expect(data.rating).to.equal(72);
      });
  });

  it('Retrieves a Review', function () {
    return Review.get(ids[0])
      .then(data => {
        expect(data.title).to.equal('Elijah Craig');
        expect(data.subtitle).to.equal('Small Batch Bourbon');
        expect(data.slug).to.equal('elijah-craig-small-batch');
        expect(data.published_at).to.be.a('date');
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic review.');
        expect(data.proof).to.equal(94);
        expect(data.manufacturer_price).to.equal(30);
        expect(data.mashbill_description).to.equal('Bourbon');
        expect(data.mashbill_recipe).to.equal('75% corn, 13% rye, 12% barley');
        expect(data.rating).to.equal(72);
        expect(data.id).to.equal(ids[0]);
      });
  });

  it('Creates missing slugs automatically', function () {
    return Review.create({
        title: 'Elijah Craig',
        subtitle: 'Barrel Proof Bourbon',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic review.'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        ids.push(data.id);
        expect(data.slug).to.equal('elijah-craig-barrel-proof-bourbon');
      });
  });

  it('Requires slugs be unique', function (done) {
    Review.create({
        title: 'Elijah Craig',
        slug: 'elijah-craig-small-batch',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic review.'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have rejected non-unique slug');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Retrieves a Review by url slug', function () {
    return Review.getBySlug('elijah-craig-small-batch')
      .then(data => {
        expect(data.id).to.be.a('number');
        expect(data.title).to.equal('Elijah Craig');
        expect(data.subtitle).to.equal('Small Batch Bourbon');
        expect(data.slug).to.equal('elijah-craig-small-batch');
      });
  });

  it('Handles empty required fields', function (done) {
    Review.create({
        title: 'Title!',
        published_at: new Date(),
        body: 'Body!'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have required an author');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a Review', function () {
    return Review.create({
        title: 'Another Review',
        author: userIds[0],
        summary: 'Another summary',
        body: 'Another body'
      })
      .then(data => {
        ids.push(data.id);
        return Review.alter(data.id, { title: 'New Title' });
      })
      .then(data => {
        expect(data.title).to.equal('New Title');
      });
  });

  it('Deletes a Review', function (done) {
    let tmpId;
    Review.create({
        title: 'Another Review',
        slug: 'another-review-2',
        author: userIds[0],
        body: 'Another body'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return Review.delete(data.id);
      })
      .then(() => Review.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed Review');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Retrieves many Reviews', function () {
    return Review.create({
        title: 'A Second Review',
        author: userIds[0],
        summary: 'Second Review summary',
        body: 'Second Review body'
      })
      .then(data => {
        ids.push(data.id);
        return Review.create({
          title: 'A Third Review',
          author: userIds[0],
          summary: 'Third Review summary',
          body: 'Third Review body',
          published_at: new Date('2000-01-01')
        });
      })
      .then(data => {
        ids.push(data.id);
        return Review.list();
      })
      .then(data => {
        expect(data).to.be.an('array');
        expect(data.length).to.be.at.least(3);
        for (let item of data) {
          expect(item.id).to.be.a('number');
          expect(item.title).to.be.a('string');
          expect(item.created_at).to.be.a('date');
          expect(item.published_at).to.be.a('date');
          expect(item.published_at).to.be.a('date');
        }
      });
  });

  it('Gets Reviews with specified ordering: title', function () {
    function getLetter(data, index) {
      return data[index].title.toUpperCase().charCodeAt(0);
    }
    return Review.list({ orderBy: 'title', order: 'ASC' })
      .then(data => {
        expect(getLetter(data, 0)).to.be.at.most(getLetter(data, 1));
        expect(getLetter(data, 1)).to.be.at.most(getLetter(data, 2));
      })
      .then(() => Review.list({ orderBy: 'title', order: 'DESC' }))
      .then(data => {
        expect(getLetter(data, 0)).to.be.at.least(getLetter(data, 1));
        expect(getLetter(data, 1)).to.be.at.least(getLetter(data, 2));
      });
  });

  it('Gets Reviews with specified ordering: publish date', function () {
    function getPublished(data, index) {
      return data[index].published_at.getTime();
    }
    return Review.list({ orderBy: 'published_at', order: 'DESC' })
      .then(data => {
        expect(getPublished(data, 0)).to.be.at.least(getPublished(data, 1));
        expect(getPublished(data, 1)).to.be.at.least(getPublished(data, 2));
      })
      .then(() => Review.list({ orderBy: 'published_at', order: 'ASC' }))
      .then(data => {
        expect(getPublished(data, 0)).to.be.at.most(getPublished(data, 1));
        expect(getPublished(data, 1)).to.be.at.most(getPublished(data, 2));
      });
  });

  it('Gets Reviews based on value', function () {
    const filters = [
      {
        field: 'title',
        value: 'A Second Review'
      }
    ];
    return Review.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
      });
  });

  it('Gets Reviews based on relative value', function () {
    const filters = [
      {
        field: 'published_at',
        comparison: 'lt',
        value: new Date('2015-01-01')
      }
    ];
    return Review.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(2);
        expect(data[0].published_at.getTime()).to.be.below(filters[0].value.getTime());
      });
  });

  it('Gets Reviews based on id value', function () {
    // we don't want to have a nested list so that ids are quickly queryable
    const filters = [
      {
        field: 'rarity',
        value: rarityIds[0]
      }
    ];
    return Review.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
      });
  });

  it('Gets Reviews based on multiple criteria', function () {
    const filters = [
      {
        field: 'title',
        value: 'Filter Me'
      },
      {
        field: 'published_at',
        comparison: 'gt',
        value: new Date('2010-01-01')
      }
    ];

    return Review.create({
        title: 'Filter Me',
        author: userIds[0],
        summary: 'First filter Review summary',
        body: 'First filter Review body',
        published_at: new Date('2012-01-01')
      })
      .then(data => {
        ids.push(data.id);
        return Review.create({
          title: 'Filter Me',
          slug: 'filter-me-2',
          author: userIds[0],
          summary: 'First filter Review summary',
          body: 'First filter Review body',
          published_at: new Date('2008-01-01')
        });
      })
      .then(data => {
        ids.push(data.id);
        return Review.list({ filters: filters });
      })
      .then(data => {
        expect(data.length).to.equal(1);
      });
  });

  it('Handles a particular Review not existing', function (done) {
    Review.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });

  it('Gets the data of associated types', function () {
    return Review.get(ids[0])
      .then(data => {
        expect(data.distillery.name).to.equal('Test Distillery');
      });
  });
});
