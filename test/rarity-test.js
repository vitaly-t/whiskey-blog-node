'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      Rarity = require('../models/rarity');

describe('Rarity model', () => {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => Rarity.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates names', function () {
    expect(Rarity.validate({ name: 'Common' }, true).result).to.be.true;
    expect(Rarity.validate({ name: 'Cømmon' }, true).result).to.be.true;
    expect(Rarity.validate({ name: '' }, true).result).to.be.false;
    expect(Rarity.validate({ name: 4 }, true).result).to.be.false;
    expect(Rarity.validate({ name: ['Uncommon'] }, true).result).to.be.false;
  });

  it('Validates filter names', function () {
    expect(Rarity.validate({ filter_name: 'Hard-to-find' }, true).result).to.be.true;
    expect(Rarity.validate({ filter_name: 'Hard-to-ƒind' }, true).result).to.be.true;
    expect(Rarity.validate({ filter_name: '' }, true).result).to.be.false;
    expect(Rarity.validate({ filter_name: 4 }, true).result).to.be.false;
    expect(Rarity.validate({ filter_name: ['Easy-to-find'] }, true).result).to.be.false;
  });

  it('Validates sort orders', function () {
    expect(Rarity.validate({ sort_order: 10 }, true).result).to.be.true;
    expect(Rarity.validate({ sort_order: 0 }, true).result).to.be.true;
    expect(Rarity.validate({ sort_order: '1' }, true).result).to.be.false;
    expect(Rarity.validate({ sort_order: 1.5 }, true).result).to.be.false;
    expect(Rarity.validate({ sort_order: NaN }, true).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            name: 'Common',
            filter_name: 'Easy-to-find',
            sort_order: 10
          },
          badData = {
            name: 'Common'
          };
    expect(Rarity.validate(goodData).result).to.be.true;
    expect(Rarity.validate(badData).result).to.be.false;
  });

  it('Stores a rarity', function () {
    return Rarity.create({
        name: 'Common',
        filter_name: 'Easy-to-find',
        sort_order: 10
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.name).to.equal('Common');
        expect(data.filter_name).to.equal('Easy-to-find');
        expect(data.sort_order).to.equal(10);
      });
  });

  it('Retrieves a rarity', function () {
    return Rarity.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.name).to.equal('Common');
        expect(data.filter_name).to.equal('Easy-to-find');
        expect(data.sort_order).to.equal(10);
      });
  });

  it('Handles empty required fields when creating', function (done) {
    Rarity.create({
        name: 'Uncommon',
        sort_order: 20
      })
      .then(data => {
        assert.fail(0, 1, 'Should have required a filter_name');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a rarity', function () {
    return Rarity.create({
        name: 'Uncommon',
        filter_name: 'Uncommon',
        sort_order: 20
      })
      .then(data => {
        ids.push(data.id);
        return Rarity.alter(data.id, { sort_order: 25 });
      })
      .then(data => {
        expect(data.sort_order).to.equal(25);
      });
  });

  it('Deletes a rarity', function (done) {
    let tmpId;
    Rarity.create({
        name: 'Rare',
        filter_name: 'Hard-to-find',
        sort_order: 30
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return Rarity.delete(data.id);
      })
      .then(() => Rarity.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed rarity');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Handles a particular rarity not existing', function (done) {
    Rarity.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });

  it('Retrieves many rarities', function () {
    return Rarity.create({
        name: 'Rare',
        filter_name: 'hard-to-find',
        sort_order: 30
      })
      .then(data => {
        ids.push(data.id);
        return Rarity.create({
          name: 'Ultra-rare',
          filter_name: 'unobtanium',
          sort_order: 40
        });
      })
      .then(data => {
        ids.push(data.id);
        return Rarity.list();
      })
      .then(data => {
        expect(data).to.be.an('array');
        expect(data.length).to.be.at.least(3);
        for (let item of data) {
          expect(item.id).to.be.a('number');
          expect(item.name).to.be.a('string');
          expect(item.filter_name).to.be.a('string');
          expect(item.sort_order).to.be.a('number');
        }
      });
  });
});
