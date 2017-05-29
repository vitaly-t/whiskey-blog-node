'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name varchar(256) NOT NULL,
      username varchar(256) UNIQUE NOT NULL,
      password_hash varchar(60) NOT NULL,
      access_level integer NOT NULL
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
      DROP TABLE users
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
