'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      Distillery = require('../models/distillery');

describe('Distillery model', () => {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => Distillery.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates names', function () {
    expect(Distillery.validate({ name: 'Buffalo Trace' }).result).to.be.true;
    expect(Distillery.validate({ name: 'Allt a\' Bhainne' }).result).to.be.true;
    expect(Distillery.validate({ name: '' }).result).to.be.false;
    expect(Distillery.validate({ name: 29 }).result).to.be.false;
    expect(Distillery.validate({ name: ['Ardbeg'] }).result).to.be.false;
  });

  it('Validates states', function () {
    expect(Distillery.validate({ state: 'Kentucky' }).result).to.be.true;
    expect(Distillery.validate({ state: 'Kentücky' }).result).to.be.true;
    expect(Distillery.validate({ state: '' }).result).to.be.false;
    expect(Distillery.validate({ state: 50 }).result).to.be.false;
    expect(Distillery.validate({ state: ['California'] }).result).to.be.false;
  });

  it('Validates cities', function () {
    expect(Distillery.validate({ city: 'Bardstown' }).result).to.be.true;
    expect(Distillery.validate({ city: 'Ballindálloch' }).result).to.be.true;
    expect(Distillery.validate({ city: 1 }).result).to.be.false;
    expect(Distillery.validate({ city: '' }).result).to.be.false;
    expect(Distillery.validate({ city: ['Louisville'] }).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            name: 'Heaven Hill',
            city: 'Bardstown',
            state: 'Kentucky'
          },
          badData = {
            name: 'Heaven Hill'
          },
          requiredFields = ['name', 'city', 'state'];
    expect(Distillery.validate(goodData, requiredFields).result).to.be.true;
    expect(Distillery.validate(badData, requiredFields).result).to.be.false;
  });

  it('Stores a Distillery', function () {
    return Distillery.create({
        name: 'Buffalo Trace',
        city: 'Frankfort',
        state: 'Kentucky'
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.name).to.equal('Buffalo Trace');
        expect(data.city).to.equal('Frankfort');
        expect(data.state).to.equal('Kentucky');
      });
  });

  it('Retrieves a Distillery', function () {
    return Distillery.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.name).to.equal('Buffalo Trace');
        expect(data.city).to.equal('Frankfort');
        expect(data.state).to.equal('Kentucky');
      });
  });

  it('Handles empty required fields when creating', function (done) {
    Distillery.create({
        name: 'Laphroaig',
        city: 'Port Ellen'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have required a state');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a Distillery', function () {
    return Distillery.create({
        name: 'Laphroaig',
        city: 'Port Ellen',
        state: 'Scotland'
      })
      .then(data => {
        ids.push(data.id);
        return Distillery.alter(data.id, { state: 'Islay' });
      })
      .then(data => {
        expect(data.state).to.equal('Islay');
      });
  });

  it('Deletes a Distillery', function (done) {
    let tmpId;
    Distillery.create({
        name: 'Wild Turkey',
        city: 'Lawrenceburg',
        state: 'Kentucky'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return Distillery.delete(data.id);
      })
      .then(() => Distillery.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed Distillery');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Handles a particular Distillery not existing', function (done) {
    Distillery.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });

  it('Retrieves many Distilleries', function () {
    return Distillery.create({
        name: 'Test Distillery',
        city: 'Lawrenceburg',
        state: 'Kentucky'
      })
      .then(data => {
        ids.push(data.id);
        return Distillery.create({
          name: 'Another Test Distillery',
          city: 'Lawrenceburg',
          state: 'Kentucky'
        });
      })
      .then(data => {
        ids.push(data.id);
        return Distillery.list();
      })
      .then(data => {
        expect(data).to.be.an('array');
        expect(data.length).to.be.at.least(3);
        for (let item of data) {
          expect(item.id).to.be.a('number');
          expect(item.name).to.be.a('string');
          expect(item.city).to.be.a('string');
          expect(item.state).to.be.a('string');
        }
      });
  });
});
