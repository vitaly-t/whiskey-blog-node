'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE posts(
      id SERIAL PRIMARY KEY,
      title varchar(512) NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      published_at timestamp with time zone NOT NULL DEFAULT now(),
      author integer REFERENCES users(id) NOT NULL,
      summary text,
      body text
    )
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none(`
      DROP TABLE posts
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
