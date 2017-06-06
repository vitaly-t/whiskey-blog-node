'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      User = require('../models/user');

describe('User model', function () {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => User.delete(id)))
      .then(() => done())
      .catch(e => {
        console.error(e);
        done();
      });
  });

  it('Validates user names', function () {
    expect(User.validate({ name: 'Tim' }, true).result).to.be.true;
    expect(User.validate({ name: '' }, true).result).to.be.false;
    expect(User.validate({ name: 4 }, true).result).to.be.false;
    expect(User.validate({ name: after }, true).result).to.be.false;
  });

  it('Validates user usernames', function () {
    expect(User.validate({ username: 'username' }, true).result).to.be.true;
    expect(User.validate({ username: 'üñîçø∂é' }, true).result).to.be.true;
    expect(User.validate({ username: 'Tim' }, true).result).to.be.false;
    expect(User.validate({ username: 19328 }, true).result).to.be.false;
    expect(User.validate({ username: after }, true).result).to.be.false;
  });

  it('Validates user passwords', function () {
    expect(User.validate({ password: 'abcdef' }, true).result).to.be.true;
    expect(User.validate({ password: 'abcd' }, true).result).to.be.false;
    expect(User.validate({ password: { password: 'password'} }, true).result).to.be.false;
    expect(User.validate({ password: false }, true).result).to.be.false;
    expect(User.validate({ password: after }, true).result).to.be.false;
  });

  it('Validates user access levels', function () {
    expect(User.validate({ access_level: 0 }, true).result).to.be.true;
    expect(User.validate({ access_level: -1 }, true).result).to.be.false;
    expect(User.validate({ access_level: 'a' }, true).result).to.be.false;
    expect(User.validate({ access_level: true }, true).result).to.be.false;
    expect(User.validate({ access_level: [1] }, true).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            name: 'Test User',
            username: 'testuser',
            password: 'abcdef',
            access_level: 1
          },
          badData = {
            name: 'Test User',
            password: 'abcdef',
            access_level: 1
          };
    expect(User.validate(goodData).result).to.be.true;
    expect(User.validate(badData).result).to.be.false;
  });

  it('Stores a user', function () {
    return User.create({
        name: 'Test User',
        username: 'testuser',
        password: 'abcdef',
        access_level: 1
      })
      .then(data => {
        expect(data.id).to.not.be.undefined;
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.name).to.equal('Test User');
        expect(data.username).to.equal('testuser');
        expect(data.access_level).to.equal(1);
      });
  });

  it('Retrieves a user by id', function () {
    return User.get(ids[0])
      .then(data => {
        expect(data).to.be.an.object;
        expect(data.id).to.equal(ids[0]);
        expect(data.name).to.be.a.string;
        expect(data.username).to.be.a.string;
      });
  });

  it('Handles an insert with empty fields', function (done) {
    User.create({})
      .then(data => {
        assert.fail(0, 1, 'Should have rejected here');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Handles an insert with non-unique username', function (done) {
    User.create({
        name: 'Test User 2',
        username: 'testuser',
        password: 'abcdef',
        access_level: 0
      })
      .then(data => {
        assert.fail(0, 1, 'Should have rejected here');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Alters a user', function () {
    return User.create({
        name: 'Another User',
        username: 'anotheruser',
        password: 'abcdef',
        access_level: 0
      })
      .then(data => {
        ids.push(data.id);
        return User.alter(data.id, { name: 'New Name' });
      })
      .then(data => {
        expect(data.name).to.equal('New Name');
      });
  });

  it('Changes a user\'s password', function () {
    return User.create({
        name: 'Another User',
        username: 'discontent_with_pw',
        password: 'originalpassword',
        access_level: 0
      })
      .then(data => {
        ids.push(data.id);
        return User.checkPassword(data.id, 'originalpassword');
      })
      .then(result => {
        expect(result).to.be.true;
        return User.alter(ids[ids.length - 1], { password: 'updatedpassword' });
      })
      .then(data => {
        return User.checkPassword(data.id, 'updatedpassword');
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('Deletes a user', function (done) {
    let tmpId;
    User.create({
        name: 'Another User',
        username: 'yetanotheruser',
        password: 'abcdef',
        access_level: 0
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        tmpId = data.id;
        return User.delete(data.id);
      })
      .then(() => User.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed user');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Gets a user by an alternate criterion', function () {
    const filters = [
      {
        field: 'username',
        value: 'testuser'
      }
    ];
    return User.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
        // can't pass an object to deep.equals due to changing ids
        expect(data[0].id).to.be.a.number;
        expect(data[0].name).to.equal('Test User');
        expect(data[0].username).to.equal('testuser');
        expect(data[0].access_level).to.equal(1);
      });
  });

  it('Gets a user by multiple criteria', function () {
    const filters = [
      {
        field: 'username',
        value: 'testuser'
      },
      {
        field: 'name',
        value: 'Test User'
      }
    ];
    return User.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
        expect(data[0].id).to.be.a.number;
        expect(data[0].name).to.equal('Test User');
        expect(data[0].username).to.equal('testuser');
        expect(data[0].access_level).to.equal(1);
      });
  });

  it('Gets no users when criteria do not match', function () {
    const filters = [
      {
        field: 'username',
        value: 'testuser'
      },
      {
        field: 'name',
        value: 'Bob'
      }
    ];
    return User.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(0);
      });
  });

  it('Hashes a password', function () {
    return User.createHash('something')
      .then(hash => {
        expect(hash).to.be.a.string;
        expect(hash.length).to.equal(60);
      });
  });

  it('Checks a correct password', function () {
    return User.create({
        name: 'Password User',
        username: 'passworduser',
        password: 'great+password',
        access_level: 0
      })
      .then(data => {
        ids.push(data.id);
        return User.checkPassword(data.id, 'great+password');
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('Checks an incorrect password', function () {
    return User.create({
        name: 'Password User 2',
        username: 'passworduser2',
        password: 'great+password2',
        access_level: 0
      })
      .then(data => {
        ids.push(data.id);
        return User.checkPassword(data.id, 'abc1234');
      })
      .then(result => {
        expect(result).to.be.false;
      });
  });
});
