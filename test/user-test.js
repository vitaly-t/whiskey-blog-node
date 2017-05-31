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
    expect(User.validate({ name: 'Tim' }).result).to.be.true;
    expect(User.validate({ name: '' }).result).to.be.false;
    expect(User.validate({ name: 4 }).result).to.be.false;
    expect(User.validate({ name: after }).result).to.be.false;
  });

  it('Validates user usernames', function () {
    expect(User.validate({ username: 'username' }).result).to.be.true;
    expect(User.validate({ username: 'üñîçø∂é' }).result).to.be.true;
    expect(User.validate({ username: 'Tim' }).result).to.be.false;
    expect(User.validate({ username: 19328 }).result).to.be.false;
    expect(User.validate({ username: after }).result).to.be.false;
  });

  it('Validates user passwords', function () {
    expect(User.validate({ password: 'abcdef' }).result).to.be.true;
    expect(User.validate({ password: 'abcd' }).result).to.be.false;
    expect(User.validate({ password: { password: 'password'} }).result).to.be.false;
    expect(User.validate({ password: false }).result).to.be.false;
    expect(User.validate({ password: after }).result).to.be.false;
  });

  it('Validates user access levels', function () {
    expect(User.validate({ access_level: 0 }).result).to.be.true;
    expect(User.validate({ access_level: -1 }).result).to.be.false;
    expect(User.validate({ access_level: 'a' }).result).to.be.false;
    expect(User.validate({ access_level: true }).result).to.be.false;
    expect(User.validate({ access_level: [1] }).result).to.be.false;
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
          },
          requiredFields = ['name', 'username', 'password', 'access_level'];
    expect(User.validate(goodData, requiredFields).result).to.be.true;
    expect(User.validate(badData, requiredFields).result).to.be.false;
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
        expect(data.password_hash.length).to.equal(60);
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
        expect(data.password_hash).to.be.a.string;
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
    let tmpHash;

    return User.create({
        name: 'Another User',
        username: 'discontent_with_pw',
        password: 'originalpassword',
        access_level: 0
      })
      .then(data => {
        ids.push(data.id);
        tmpHash = data.password_hash;
        expect(tmpHash.length).to.equal(60);
        return User.alter(data.id, { password: 'updatedpassword' });
      })
      .then(data => {
        expect(data.password_hash.length).to.equal(60);
        expect(data.password_hash).to.not.equal(tmpHash);
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
    return User.find({ username: 'testuser' })
      .then(data => {
        expect(data.length).to.equal(1);
        // can't pass an object to deep.equals due to changing ids
        expect(data[0].id).to.be.a.number;
        expect(data[0].name).to.equal('Test User');
        expect(data[0].username).to.equal('testuser');
        expect(data[0].password_hash).to.be.a.string;
        expect(data[0].password_hash.length).to.equal(60);
        expect(data[0].access_level).to.equal(1);
      });
  });

  it('Gets a user by multiple criteria', function () {
    return User.find({ username: 'testuser', name: 'Test User' })
      .then(data => {
        expect(data.length).to.equal(1);
        expect(data[0].id).to.be.a.number;
        expect(data[0].name).to.equal('Test User');
        expect(data[0].username).to.equal('testuser');
        expect(data[0].password_hash).to.be.a.string;
        expect(data[0].password_hash.length).to.equal(60);
        expect(data[0].access_level).to.equal(1);
      });
  });

  it('Gets no users when criteria do not match', function () {
    return User.find({ username: 'testuser', name: 'Bob' })
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
    return User.createHash('password')
      .then(hash => User.checkPassword('password', hash))
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('Checks an incorrect password', function () {
    return User.createHash('password')
      .then(hash => User.checkPassword('passw0rd', hash))
      .then(result => {
        expect(result).to.be.false;
      });
  });
});
