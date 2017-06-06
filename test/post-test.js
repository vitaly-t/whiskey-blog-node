'use strict';

const expect = require('chai').expect,
      assert = require('chai').assert,
      Post = require('../models/post/post'),
      User = require('../models/user/user');

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
    expect(Post.validate({ title: 'Title' }, true).result).to.be.true;
    expect(Post.validate({ title: 'Tî†lé' }, true).result).to.be.true;
    expect(Post.validate({ title: '' }, true).result).to.be.false;
    expect(Post.validate({ title: 4 }, true).result).to.be.false;
    expect(Post.validate({ title: ['Title'] }, true).result).to.be.false;
  });

  it('Validates Post slugs', function () {
    expect(Post.validate({ slug: 'title' }, true).result).to.be.true;
    expect(Post.validate({ slug: 'dash-delimited-title' }, true).result).to.be.true;
    expect(Post.validate({ slug: 'space delimited title' }, true).result).to.be.false;
    expect(Post.validate({ slug: '0-leading-number' }, true).result).to.be.false;
    expect(Post.validate({ slug: 'nøƒancyünicode' }, true).result).to.be.false;
    expect(Post.validate({ slug: '' }, true).result).to.be.false;
    expect(Post.validate({ slug: 4 }, true).result).to.be.false;
    expect(Post.validate({ slug: ['title'] }, true).result).to.be.false;
  });

  it('Validates post publish dates', function () {
    expect(Post.validate({ published_at: new Date() }, true).result).to.be.true;
    expect(Post.validate({ published_at: 1496186149957 }, true).result).to.be.false;
    expect(Post.validate({ published_at: '2017-05-30T00:00:00Z' }, true).result).to.be.false;
    expect(Post.validate({ published_at: {} }, true).result).to.be.false;
    expect(Post.validate({ published_at: after }, true).result).to.be.false;
  });

  it('Validates post authors', function () {
    expect(Post.validate({ author: 4 }, true).result).to.be.true;
    expect(Post.validate({ author: 'Tim' }, true).result).to.be.false;
    expect(Post.validate({ author: -1 }, true).result).to.be.false;
    expect(Post.validate({ author: 5.45 }, true).result).to.be.false;
    expect(Post.validate({ author: after }, true).result).to.be.false;
  });

  it('Validates post summaries', function () {
    expect(Post.validate({ summary: 'Summary!' }, true).result).to.be.true;
    expect(Post.validate({ summary: '' }, true).result).to.be.false;
    expect(Post.validate({ summary: 123 }, true).result).to.be.false;
    expect(Post.validate({ summary: after }, true).result).to.be.false;
    expect(Post.validate({ summary: ['a', 'b'] }, true).result).to.be.false;
  });

  it('Validates post bodies', function () {
    expect(Post.validate({ body: 'Body!' }, true).result).to.be.true;
    expect(Post.validate({ body: '' }, true).result).to.be.false;
    expect(Post.validate({ body: 123 }, true).result).to.be.false;
    expect(Post.validate({ body: after }, true).result).to.be.false;
    expect(Post.validate({ body: ['a', 'b'] }, true).result).to.be.false;
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
          };
    expect(Post.validate(goodData).result).to.be.true;
    expect(Post.validate(badData).result).to.be.false;
  });

  it('Stores a complete post', function () {
    return Post.create({
        title: 'My Post Title',
        slug: 'my-post-title',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic post.'
      })
      .then(data => {
        expect(data.id).to.be.a.number;
        ids.push(data.id);
        expect(data.title).to.equal('My Post Title');
        expect(data.slug).to.equal('my-post-title');
        expect(data.author.id).to.be.a.number;
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic post.');
      });
  });

  it('Retrieves a post', function () {
    return Post.get(ids[0])
      .then(data => {
        expect(data.id).to.equal(ids[0]);
        expect(data.title).to.equal('My Post Title');
        expect(data.slug).to.equal('my-post-title');
        expect(data.published_at).to.be.a('date');
        expect(data.author.id).to.be.a.number;
        expect(data.summary).to.equal('A great summary');
        expect(data.body).to.equal('This is a fantastic post.');
      });
  });

  it('Creates missing slugs automatically', function () {
    return Post.create({
        title: 'Something You Should Know',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic post.'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        ids.push(data.id);
        expect(data.slug).to.equal('something-you-should-know');
      });
  });

  it('Requires slugs be unique', function (done) {
    Post.create({
        title: 'My Post-Title',
        slug: 'my-post-title',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic post.'
      })
      .then(data => {
        assert.fail(0, 1, 'Should have rejected non-unique slug');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Retrieves a Post by url slug', function () {
    return Post.getBySlug('my-post-title')
      .then(data => {
        expect(data.id).to.be.a('number');
        expect(data.title).to.equal('My Post Title');
        expect(data.slug).to.equal('my-post-title');
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

  it('Deletes a post', function (done) {
    let tmpId;
    Post.create({
        title: 'Another Post',
        slug: 'another-post-2',
        author: userIds[0],
        body: 'Another body'
      })
      .then(data => {
        expect(data.id).to.be.a('number');
        tmpId = data.id;
        return Post.delete(data.id);
      })
      .then(() => Post.get(tmpId))
      .then(() => {
        assert.fail(0, 1, 'Should not have been able to get removed post');
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
  });

  it('Retrieves many posts', function () {
    return Post.create({
        title: 'A Second Post',
        author: userIds[0],
        summary: 'Second post summary',
        body: 'Second post body'
      })
      .then(data => {
        ids.push(data.id);
        return Post.create({
          title: 'A Third Post',
          author: userIds[0],
          summary: 'Third post summary',
          body: 'Third post body',
          published_at: new Date('2000-01-01')
        });
      })
      .then(data => {
        ids.push(data.id);
        return Post.list();
      })
      .then(data => {
        expect(data).to.be.an('array');
        expect(data.length).to.be.at.least(3);
        for (let item of data) {
          expect(item.id).to.be.a('number');
          expect(item.title).to.be.a('string');
          expect(item.created_at).to.be.a('date');
          expect(item.published_at).to.be.a('date');
          expect(item.published_at).to.be.a('date');
          expect(item.author).to.be.a('number');
        }
      });
  });

  it('Gets posts with specified ordering: title', function () {
    function getLetter(data, index) {
      return data[index].title.toUpperCase().charCodeAt(0);
    }
    return Post.list({ orderBy: 'title', order: 'ASC' })
      .then(data => {
        expect(getLetter(data, 0)).to.be.at.most(getLetter(data, 1));
        expect(getLetter(data, 1)).to.be.at.most(getLetter(data, 2));
      })
      .then(() => Post.list({ orderBy: 'title', order: 'DESC' }))
      .then(data => {
        expect(getLetter(data, 0)).to.be.at.least(getLetter(data, 1));
        expect(getLetter(data, 1)).to.be.at.least(getLetter(data, 2));
      });
  });

  it('Gets posts with specified ordering: publish date', function () {
    function getPublished(data, index) {
      return data[index].published_at.getTime();
    }
    return Post.list({ orderBy: 'published_at', order: 'DESC' })
      .then(data => {
        expect(getPublished(data, 0)).to.be.at.least(getPublished(data, 1));
        expect(getPublished(data, 1)).to.be.at.least(getPublished(data, 2));
      })
      .then(() => Post.list({ orderBy: 'published_at', order: 'ASC' }))
      .then(data => {
        expect(getPublished(data, 0)).to.be.at.most(getPublished(data, 1));
        expect(getPublished(data, 1)).to.be.at.most(getPublished(data, 2));
      });
  });

  it('Gets posts based on value', function () {
    const filters = [
      {
        field: 'title',
        value: 'A Second Post'
      }
    ];
    return Post.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
      });
  });

  it('Gets posts based on relative value', function () {
    const filters = [
      {
        field: 'published_at',
        comparison: 'lt',
        value: new Date('2015-01-01')
      }
    ];
    return Post.list({ filters: filters })
      .then(data => {
        expect(data.length).to.equal(1);
        expect(data[0].published_at.getTime()).to.be.below(filters[0].value.getTime());
      });
  });

  it('Gets posts based on multiple criteria', function () {
    const filters = [
      {
        field: 'title',
        value: 'Filter Me'
      },
      {
        field: 'published_at',
        comparison: 'gt',
        value: new Date('2010-01-01')
      }
    ];

    return Post.create({
        title: 'Filter Me',
        author: userIds[0],
        summary: 'First filter post summary',
        body: 'First filter post body',
        published_at: new Date('2012-01-01')
      })
      .then(data => {
        ids.push(data.id);
        return Post.create({
          title: 'Filter Me',
          slug: 'filter-me-2',
          author: userIds[0],
          summary: 'First filter post summary',
          body: 'First filter post body',
          published_at: new Date('2008-01-01')
        });
      })
      .then(data => {
        ids.push(data.id);
        return Post.list({ filters: filters });
      })
      .then(data => {
        expect(data.length).to.equal(1);
      });
  });

  it('Handles a particular post not existing', function (done) {
    Post.get(1234567)
      .then(data => {
        assert.fail(0, 1, 'Should have rejected on failed get')
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      })
  });


  it('Stores related Posts', function () {
    return Post.create({
        title: 'Some Other Article',
        author: userIds[0],
        summary: 'A great summary',
        body: 'This is a fantastic article.',
        related_posts: [ids[0], ids[1]]
      })
      .then(data => {
        ids.push(data.id);
        return Post.get(data.id);
      })
      .then(data => {
        expect(data.related_posts).to.be.an('array');
        expect(data.related_posts.length).to.equal(2);
        expect(data.related_posts[0].title).to.be.a('string');
        expect(data.related_posts[1].title).to.be.a('string');
      });
  });
});
