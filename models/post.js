'use strict';

const db = require('../models/_db').db;

exports.validate = function (data, requiredFields) {
  if (requiredFields) {
    for (const field of requiredFields) {
      if (!data.hasOwnProperty(field))
        return { result: false, message: `Missing required field '${field}'`};
    }
  }

  if (data.hasOwnProperty('title')) {
    if (typeof data.title !== 'string')
      return { result: false, message: 'Title should be a string'};
    if (data.title.length < 1)
      return { result: false, message: 'Title needs to have at least 1 character'};
    if (data.title.length > 512)
      return { result: false, message: 'Title can\'t be more than 512 characters'};
  }
  if (data.hasOwnProperty('published_at')) {
    if (typeof data.published_at.getMonth !== 'function')
      return { result: false, message: 'Publish date should be a Date object'};
  }
  if (data.hasOwnProperty('author')) {
    if (typeof data.author !== 'number' || data.author % 1 !== 0)
      return { result: false, message: 'Author id must be an integer'};
    if (data.author < 0)
      return { result: false, message: 'Author id must be a positive integer'};
  }
  if (data.hasOwnProperty('summary')) {
    if (typeof data.summary !== 'string')
      return { result: false, message: 'Summary should be a string'};
    if (data.summary.length < 1)
      return { result: false, message: 'Summary will not accept an empty string'};
  }
  if (data.hasOwnProperty('body')) {
    if (typeof data.body !== 'string')
      return { result: false, message: 'Body should be a string'};
    if (data.body.length < 1)
      return { result: false, message: 'Body will not accept an empty string'};
  }

  return { result: true };
}

// create a new post
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['title', 'author']);
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
  // tbd
};

// remove a post
exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    db.none('DELETE FROM posts WHERE posts.id = $1', id)
      .then(() => resolve())
      .catch(e => reject(e));
  });
};
