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
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get a deeply-nested post by id
exports.get = function (id) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object
  return db.oneOrNone('SELECT * FROM posts WHERE posts.id = $1', id)
    .then(post => {
      result = post;
      return User.get(result.author)
    })
    .then(user => {
      result.author = user;
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

        // returned related authors have been expanded, and we can't reassign them in that state
        if (existingData.author && typeof existingData.author === 'object') {
          existingData.author = existingData.author.id;
        } else if (typeof existingData.author === 'undefined') {
          existingData.author = null;
        }

        newData = Object.assign(existingData, newData);

        return db.one(cmd, newData);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// remove a post
exports.delete = function (id) {
  return db.none('DELETE FROM posts WHERE posts.id = $1', id);
};
