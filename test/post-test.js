'use strict';

const expect = require('chai').expect,
      Post = require('../models/post'),
      User = require('../models/user');

describe('Post model', () => {

  var ids = [],
      userIds = [];

  before(function (done) {
    User.create({
      name: 'Test User',
      username: 'testuser',
      password: 'abcdef',
      access_level: 1
    })
    .then(data => {
      userIds.push(data.id);
      done();
    })
    .catch(e => console.error(e));
  });

  after(function (done) {
    Promise.all(ids.map(id => Post.delete(id)))
      .then(() => {
        Promise.all(userIds.map(id => User.delete(id)))
          .then(() => {
            done();
          })
          .catch(e => console.error(e));
      })
      .catch(e => console.error(e));
  });

  it('Validates post information');

  it('Stores a complete post', function () {
    return Post.create({
        title: 'My Post Title',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic post.'
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.title).to.equal('My Post Title');
        expect(data.author).to.be.a.number;
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic post.');
      });
  });

  it('Retrieves a post', function () {
    return Post.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.title).to.equal('My Post Title');
        expect(data.author).to.be.a.number;
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic post.');
        expect(data.created_at.getMonth).to.be.a.function;
        expect(data.published_at.getMonth).to.be.a.function;
      });
  });

  it('Handles empty required fields');
  it('Alters a post');
  it('Deletes a post');
  it('Retrieves many posts');
  it('Gets posts based on criteria');
  it('Gets posts with specified ordering: title');
  it('Gets posts with specified ordering: publish date');
  it('Handles a particular post not existing');
});
