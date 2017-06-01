'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      Region = require('../models/region');

describe('Region model', () => {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => Region.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates names', function () {
    expect(Region.validate({ name: 'Kentucky' }).result).to.be.true;
    expect(Region.validate({ name: 'Hîghlands' }).result).to.be.true;
    expect(Region.validate({ name: '' }).result).to.be.false;
    expect(Region.validate({ name: 4 }).result).to.be.false;
    expect(Region.validate({ name: ['Islay'] }).result).to.be.false;
  });

  it('Validates filter names', function () {
    expect(Region.validate({ filter_name: 'Kentucky' }).result).to.be.true;
    expect(Region.validate({ filter_name: 'Rest øf the US' }).result).to.be.true;
    expect(Region.validate({ filter_name: '' }).result).to.be.false;
    expect(Region.validate({ filter_name: 2 }).result).to.be.false;
    expect(Region.validate({ filter_name: ['Tennessee'] }).result).to.be.false;
  });

  it('Validates sort orders', function () {
    expect(Region.validate({ sort_order: 10 }).result).to.be.true;
    expect(Region.validate({ sort_order: -10 }).result).to.be.true;
    expect(Region.validate({ sort_order: 1.25 }).result).to.be.false;
    expect(Region.validate({ sort_order: 'first' }).result).to.be.false;
    expect(Region.validate({ sort_order: NaN }).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            name: 'United States: Kentucky',
            filter_name: 'Kentucky',
            sort_order: 60
          },
          badData = {
            name: 'United States: Kentucky',
            filter_name: 'Kentucky'
          },
          requiredFields = ['name', 'filter_name', 'sort_order'];
    expect(Region.validate(goodData, requiredFields).result).to.be.true;
    expect(Region.validate(badData, requiredFields).result).to.be.false;
  });

  it('Stores a Region', function () {
    return Region.create({
        name: 'Scotland: Islay',
        filter_name: 'Islay',
        sort_order: 120
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.name).to.equal('Scotland: Islay');
        expect(data.filter_name).to.equal('Islay');
        expect(data.sort_order).to.equal(120);
      });
  });

  it('Retrieves a Region', function () {
    return Region.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.name).to.equal('Scotland: Islay');
        expect(data.filter_name).to.equal('Islay');
        expect(data.sort_order).to.equal(120);
      });
  });

  it('Handles empty required fields when creating', function (done) {
    Region.create({
        name: 'Scotland: Isle of Skye',
        filter_name: 'the Isle of Skye'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have required a sort_order');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a Region', function () {
    return Region.create({
        name: 'Scotland: Isle of Skye',
        filter_name: 'the Isle of Skye',
        sort_order: 140
      })
      .then(data => {
        ids.push(data.id);
        return Region.alter(data.id, { sort_order: 160 });
      })
      .then(data => {
        expect(data.sort_order).to.equal(160);
      });
  });

  it('Deletes a Region', function (done) {
    let tmpId;
    Region.create({
        name: 'United States: other',
        filter_name: 'minor bourbon-producing US states',
        sort_order: 30
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return Region.delete(data.id);
      })
      .then(() => Region.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed Region');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Handles a particular Region not existing', function (done) {
    Region.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });

  it('Retrieves many Regions', function () {
    return Region.create({
        name: 'Scotland: Highlands',
        filter_name: 'the Highlands of Scotland',
        sort_order: 30
      })
      .then(data => {
        ids.push(data.id);
        return Region.create({
          name: 'Scotland: Lowlands',
          filter_name: 'the Lowlands of Scotland',
          sort_order: 40
        });
      })
      .then(data => {
        ids.push(data.id);
        return Region.list();
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
