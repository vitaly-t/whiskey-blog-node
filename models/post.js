'use strict';

const db = require('../models/_db').db;

exports.validate = function (data, requiredFields) {
	// tbd
}

// create a new post
exports.create = function (data) {
  return new Promise((resolve, reject) => {
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
