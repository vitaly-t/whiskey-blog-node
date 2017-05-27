const expect = require('chai').expect,
      User = require('../models/user');

describe('User model', function () {

  var ids = [];

  after(function (done) {
    Promise.all(ids.map(id => User.delete(id)))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Stores a user', function (done) {
    User.create({
      name: 'Test User',
      username: 'testuser',
      password_hash: 'abcd',
      accessLevel: 1
    }).then(data => {
      expect(data.id).to.not.be.undefined;
      expect(data.id).to.be.a.number;
      ids.push(data.id);
      done();
    }).catch(e => {
      assert.fail(e);
      done();
    });
  });

  it('Retrieves a user by id', function (done) {
    User.get(ids[0])
      .then(data => {
        expect(data).to.be.an.object;
        expect(data.id).to.equal(ids[0]);
        expect(data.name).to.be.a.string;
        expect(data.username).to.be.a.string;
        expect(data.password_hash).to.be.a.string;
        done();
      })
      .catch(e => {
        assert.fail(e);
        done();
      });
  });

  it('Handles an insert with empty fields', function (done) {
    User.create({})
      .then(data => {
        assert.fail('Should have rejected here');
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
      accessLevel: 0
    }).then(data => {
      assert.fail('Should have rejected here');
      done();
    }).catch(e => {
      expect(e).to.exist;
      done();
    });
  });

  it('Alters a user');
  it('Deletes a user');
  it('Handles bad data');
});
