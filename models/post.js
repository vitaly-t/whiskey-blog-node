'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation'),
      where = require('../helpers/where').where,
      slugFromString = require('../helpers/slug').fromString,
      User = require('./user');

exports.validate = function (data, required) {
  const schema = {
    title: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    slug: {
      types: ['string'],
      minLength: 1,
      maxLength: 128,
      regex: /^[a-zA-Z][a-zA-Z0-9\-]*$/
    },
    published_at: {
      types: ['date']
    },
    author: {
      types: ['number'],
      min: 0,
      step: 1
    },
    summary: {
      types: ['string'],
      minLength: 1
    },
    body: {
      types: ['string'],
      minLength: 1
    },
    related_reviews: {
      types: ['array'],
      elementTypes: ['number']
    },
    related_posts: {
      types: ['array'],
      elementTypes: ['number']
    }
  };

  return validation.validate(data, schema, required);
}

// create a new post
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['title', 'author', 'body']);
    if (validation.result === false) {
      reject(`Failed to create post: ${validation.message}`);
    }

    let stored;

    const cmd = `INSERT INTO posts(
                   title,
                   slug,
                   published_at,
                   author,
                   summary,
                   body
                 ) VALUES (
                   $(title),
                   $(slug),
                   $(published_at),
                   $(author),
                   $(summary),
                   $(body)
                 ) RETURNING
                   id,
                   title,
                   slug,
                   created_at,
                   published_at,
                   author,
                   summary,
                   body`;

    const defaultData = {
      title: null,
      slug: function () {
        return slugFromString(this.title);
      },
      published_at: new Date(),
      author: null,
      summary: null,
      body: null,
    }

    data = Object.assign(defaultData, data);

    db.one(cmd, data)
      .then(returned => {
        stored = returned;
        return exports.createRelated(stored.id, data.related_reviews, data.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};

// get a deeply-nested post by id
exports.get = function (id) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object. refactor to do
  // in a single tx if ever porting this to Review.list()
  return db.oneOrNone('SELECT * FROM posts WHERE posts.id = $1', id)
    .then(post => {
      result = post;
      return User.get(result.author)
    })
    .then(user => {
      result.author = user;
      return exports.getRelatedReviews(id);
    })
    .then(relatedReviews => {
      result.related_reviews = relatedReviews;
      return exports.getRelatedPosts(id);
    })
    .then(relatedPosts => {
      result.related_posts = relatedPosts;
      return result;
    });
};

// get a deeply-nested post by url slug
exports.getBySlug = function (slug) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object
  return db.oneOrNone('SELECT * FROM posts WHERE posts.slug = $1', slug)
    .then(post => {
      result = post;
      return User.get(result.author)
    })
    .then(user => {
      result.author = user;
      return exports.getRelatedReviews(result.id);
    })
    .then(relatedReviews => {
      result.related_reviews = relatedReviews;
      return exports.getRelatedPosts(result.id);
    })
    .then(relatedPosts => {
      result.related_posts = relatedPosts;
      return result;
    });
};

// shallow list posts, with options to page, order, and filter
exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'published_at',
    order: 'DESC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM posts';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};

// change a post
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter post: ${validation.message}`);
    }

    let stored;

    exports.get(id)
      .then(existingData => {
        const cmd = `UPDATE posts SET
                      title = $(title),
                      slug = $(slug),
                      published_at = $(published_at),
                      author = $(author),
                      summary = $(summary),
                      body = $(body)
                    WHERE id = $(id)
                    RETURNING
                      id,
                      title,
                      slug,
                      created_at,
                      published_at,
                      author,
                      summary,
                      body`;

        // returned related objects have been expanded, and we can't reassign them in that state
        for (let relation of ['author', 'related_reviews', 'related_posts']) {
          if (existingData[relation] && typeof existingData[relation] === 'object') {
            existingData[relation] = existingData[relation].id;
          } else if (typeof existingData[relation] === 'undefined') {
            existingData[relation] = null;
          }
        }

        newData = Object.assign(existingData, newData);

        return db.one(cmd, newData);
      })
      .then(returned => {
        stored = returned;
        return exports.createRelated(stored.id, newData.related_reviews, newData.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};

// remove a post
exports.delete = function (id) {
  return db.none('DELETE FROM posts WHERE posts.id = $1', id);
};

// add related data to their respective tables
exports.createRelated = function (origin, reviews, posts) {

  // first, wipe out existing (avoiding update checks for now)
  return db.none(`DELETE FROM posts_related_reviews WHERE origin = $1`, origin)
    .then(() => db.none(`DELETE FROM posts_related_posts WHERE origin = $1`, origin))
    .then(() => {
      let ops = [];
      if (reviews) {
        ops.concat(reviews.map(review => db.none(`
          INSERT INTO posts_related_reviews(
            origin,
            related
          ) VALUES (
            $1,
            $2
          )
        `, [origin, review])));
      }
      if (posts) {
        ops.concat(posts.map(post => db.none(`
          INSERT INTO posts_related_posts(
            origin,
            related
          ) VALUES (
            $1,
            $2
          )
        `, [origin, post])));
      }
      return Promise.all(ops);
    });
};

// fetch related reviews
exports.getRelatedReviews = function (id) {
  return db.any(`SELECT
                  reviews.id,
                  reviews.title,
                  reviews.subtitle,
                  reviews.slug,
                  reviews.summary
                FROM posts_related_reviews
                LEFT JOIN reviews
                  ON posts_related_reviews.origin = $1
                  AND posts_related_reviews.related = reviews.id`, id);
};

// fetch related posts
exports.getRelatedPosts = function (id) {
  return db.any(`SELECT
                  posts.id,
                  posts.title,
                  posts.slug,
                  posts.summary
                FROM posts_related_posts
                LEFT OUTER JOIN posts
                  ON posts_related_posts.origin = $1
                  AND posts_related_posts.related = posts.id`, id);
};

