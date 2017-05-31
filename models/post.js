'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation');

exports.validate = function (data, required) {
  const schema = {
    title: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
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
      reject(`Failed to create user: ${validation.message}`);
    }

    const cmd = `INSERT INTO posts(
                   title,
                   published_at,
                   author,
                   summary,
                   body
                 ) VALUES (
                   $(title),
                   $(published_at),
                   $(author),
                   $(summary),
                   $(body)
                 ) RETURNING
                   id,
                   title,
                   created_at,
                   published_at,
                   author,
                   summary,
                   body`;

    if (!data.published_at) {
      data.published_at = new Date();
    }

    db.one(cmd, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get a post by id
exports.get = function (id) {
  return new Promise((resolve, reject) => {
    db.one('SELECT * FROM posts WHERE id = $1', id)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get post by arbitrary column(s)
exports.list = function (filters, orderBy) {
  // tbd
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
        const data = Object.assign(existingData, newData),
              cmd = `UPDATE posts SET
                      title = $(title),
                      published_at = $(published_at),
                      author = $(author),
                      summary = $(summary),
                      body = $(body)
                    WHERE id = $(id)
                    RETURNING
                      id,
                      title,
                      created_at,
                      published_at,
                      author,
                      summary,
                      body`;
        db.one(cmd, data)
          .then(data => resolve(data))
          .catch(e => reject(e));
      })
      .catch(e => reject(e));

  });
};

// remove a post
exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    db.none('DELETE FROM posts WHERE posts.id = $1', id)
      .then(() => resolve())
      .catch(e => reject(e));
  });
};
