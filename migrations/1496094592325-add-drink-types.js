'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE drink_types(
      id SERIAL PRIMARY KEY,
      singular varchar(64) NOT NULL,
      plural varchar(64) NOT NULL
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
      DROP TABLE drink_types
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
