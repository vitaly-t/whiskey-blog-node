const expect = require('chai').expect,
      assert = require('chai').assert,
      User = require('../models/user');

describe('User model', function () {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => User.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Stores a user', function () {
    return User.create({
      name: 'Test User',
      username: 'testuser',
      password_hash: 'abcd',
      access_level: 1
    }).then(data => {
      expect(data.id).to.not.be.undefined;
      expect(data.id).to.be.a.number;
      ids.push(data.id);
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
      password_hash: 'abcd',
      access_level: 0
    }).then(data => {
      assert.fail(0, 1, 'Should have rejected here');
      done();
    }).catch(e => {
      expect(e).to.exist;
      done();
    });
  });

  it('Alters a user', function () {
    function alterUser(data) {
      ids.push(data.id);
      return new Promise((resolve, reject) => {
        User.alter(data.id, { name: 'New Name' })
          .then(data => resolve(data))
          .catch(e => reject(e));
      });
    }

    return User.create({
        name: 'Another User',
        username: 'anotheruser',
        password_hash: 'abcd',
        access_level: 0
      })
      .then(alterUser)
      .then(User.getFromData)
      .then(data => {
        expect(data.name).to.equal('New Name');
      });
  });

  it('Deletes a user', function (done) {
    let tmpId;
    function handleError(e) {
      assert.fail(0, 1, e);
      done();
    }
    User.create({
        name: 'Another User',
        username: 'yetanotheruser',
        password_hash: 'abcd',
        access_level: 0
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        tmpId = data.id;
        User.delete(data.id)
          .then(() => {
            User.get(tmpId)
              .then(() => {
                assert.fail(0, 1, 'Should not have been able to get removed user');
                done();
              })
              .catch(e => {
                expect(e).to.exist;
                done();
              });
          })
          .catch(handleError);
      })
      .catch(handleError);
  });

  it('Gets a user by an alternate criterion', function () {
    return User.find({ username: 'testuser' })
      .then(data => {
        expect(data.length).to.equal(1);
        // can't pass an object to deep.equals due to changing ids
        expect(data[0].id).to.be.a.number;
        expect(data[0].name).to.equal('Test User');
        expect(data[0].username).to.equal('testuser');
        expect(data[0].password_hash).to.equal('abcd');
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
        expect(data[0].password_hash).to.equal('abcd');
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

  it('Checks a correct password', function (done) {
    User.createHash('password')
      .then(hash => {
        User.checkPassword('password', hash)
          .then(result => {
            expect(result).to.be.true;
            done();
          })
          .catch(e => {
            assert.fail(0, 1, e);
            done();
          });
      })
      .catch(e => {
        assert.fail(0, 1, e);
        done();
      });
  });

  it('Checks an incorrect password', function (done) {
    User.createHash('password')
      .then(hash => {
        User.checkPassword('passw0rd', hash)
          .then(result => {
            expect(result).to.be.false;
            done();
          })
          .catch(e => {
            assert.fail(0, 1, e);
            done();
          });
      })
      .catch(e => {
        assert.fail(0, 1, e);
        done();
      });
  });
});
