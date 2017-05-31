'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
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
    .catch(e => {
      console.error(e)
      done();
    });
  });

  after(function (done) {
    Promise.all(ids.map(id => Post.delete(id)))
      .then(() => Promise.all(userIds.map(id => User.delete(id))))
      .then(() => done())
      .catch(e => console.error(e));
  });

  it('Validates post titles', function () {
    expect(Post.validate({ title: 'Title' }).result).to.be.true;
    expect(Post.validate({ title: 'Tî†lé' }).result).to.be.true;
    expect(Post.validate({ title: '' }).result).to.be.false;
    expect(Post.validate({ title: 4 }).result).to.be.false;
    expect(Post.validate({ title: ['Title'] }).result).to.be.false;
  });

  it('Validates post publish dates', function () {
    expect(Post.validate({ published_at: new Date() }).result).to.be.true;
    expect(Post.validate({ published_at: 1496186149957 }).result).to.be.false;
    expect(Post.validate({ published_at: '2017-05-30T00:00:00Z' }).result).to.be.false;
    expect(Post.validate({ published_at: {} }).result).to.be.false;
    expect(Post.validate({ published_at: after }).result).to.be.false;
  });

  it('Validates post authors', function () {
    expect(Post.validate({ author: 4 }).result).to.be.true;
    expect(Post.validate({ author: 'Tim' }).result).to.be.false;
    expect(Post.validate({ author: -1 }).result).to.be.false;
    expect(Post.validate({ author: 5.45 }).result).to.be.false;
    expect(Post.validate({ author: after }).result).to.be.false;
  });

  it('Validates post summaries', function () {
    expect(Post.validate({ summary: 'Summary!' }).result).to.be.true;
    expect(Post.validate({ summary: '' }).result).to.be.false;
    expect(Post.validate({ summary: 123 }).result).to.be.false;
    expect(Post.validate({ summary: after }).result).to.be.false;
    expect(Post.validate({ summary: ['a', 'b'] }).result).to.be.false;
  });

  it('Validates post bodies', function () {
    expect(Post.validate({ body: 'Body!' }).result).to.be.true;
    expect(Post.validate({ body: '' }).result).to.be.false;
    expect(Post.validate({ body: 123 }).result).to.be.false;
    expect(Post.validate({ body: after }).result).to.be.false;
    expect(Post.validate({ body: ['a', 'b'] }).result).to.be.false;
  });

  it('Correctly handles required fields', function () {
    const goodData = {
            title: 'Title!',
            author: 28,
            summary: 'Summary!',
            body: 'Body!'
          },
          badData = {
            title: 'Title!',
            body: 'Body!'
          },
          requiredFields = ['title', 'author', 'body'];
    expect(Post.validate(goodData, requiredFields).result).to.be.true;
    expect(Post.validate(badData, requiredFields).result).to.be.false;
  });

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

  it('Handles empty required fields', function (done) {
    Post.create({
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

  it('Alters a post', function () {
    return Post.create({
        title: 'Another Post',
        author: userIds[0],
        summary: 'Another summary',
        body: 'Another body'
      })
      .then(data => {
        ids.push(data.id);
        return Post.alter(data.id, { title: 'New Title' });
      })
      .then(data => {
        expect(data.title).to.equal('New Title');
      });
  });

  it('Deletes a post');
  it('Retrieves many posts');
  it('Gets posts based on criteria');
  it('Gets posts with specified ordering: title');
  it('Gets posts with specified ordering: publish date');
  it('Handles a particular post not existing');
});
