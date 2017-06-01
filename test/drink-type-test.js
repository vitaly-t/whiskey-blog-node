'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      DrinkType = require('../models/drink-type');

describe('DrinkType model', () => {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => DrinkType.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates drink type singular names', function () {
    expect(DrinkType.validate({ singular: 'Rye' }).result).to.be.true;
    expect(DrinkType.validate({ singular: 'Bøurbon' }).result).to.be.true;
    expect(DrinkType.validate({ singular: '' }).result).to.be.false;
    expect(DrinkType.validate({ singular: 4 }).result).to.be.false;
    expect(DrinkType.validate({ singular: ['Scotch'] }).result).to.be.false;
  });

  it('Validates drink type plural names', function () {
    expect(DrinkType.validate({ plural: 'Ryes' }).result).to.be.true;
    expect(DrinkType.validate({ plural: 'Bøurbons' }).result).to.be.true;
    expect(DrinkType.validate({ plural: '' }).result).to.be.false;
    expect(DrinkType.validate({ plural: 4 }).result).to.be.false;
    expect(DrinkType.validate({ plural: ['Scotches'] }).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            singular: 'Rye',
            plural: 'Ryes'
          },
          badData = {
            singular: 'Rye'
          },
          requiredFields = ['singular', 'plural'];
    expect(DrinkType.validate(goodData, requiredFields).result).to.be.true;
    expect(DrinkType.validate(badData, requiredFields).result).to.be.false;
  });

  it('Stores a drink type', function () {
    return DrinkType.create({
        singular: 'Bourbon',
        plural: 'Bourbons'
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.singular).to.equal('Bourbon');
        expect(data.plural).to.equal('Bourbons');
      });
  });

  it('Retrieves a drink type', function () {
    return DrinkType.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.singular).to.equal('Bourbon');
        expect(data.plural).to.equal('Bourbons');
      });
  });

  it('Handles empty required fields when creating', function (done) {
    DrinkType.create({
        singular: 'Tennessee Whiskey'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have required a plural name');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a drink type', function () {
    return DrinkType.create({
        singular: 'Tennessee Whiskey',
        plural: 'Tennessee Whiskys'
      })
      .then(data => {
        ids.push(data.id);
        return DrinkType.alter(data.id, { plural: 'Tennessee Whiskies' });
      })
      .then(data => {
        expect(data.plural).to.equal('Tennessee Whiskies');
      });
  });

  it('Deletes a drink type', function (done) {
    let tmpId;
    DrinkType.create({
        singular: 'American Whiskey',
        plural: 'American Whiskies'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return DrinkType.delete(data.id);
      })
      .then(() => DrinkType.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed drink type');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Handles a particular drink type not existing', function (done) {
    DrinkType.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });
});
