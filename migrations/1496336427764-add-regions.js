'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE regions(
      id SERIAL PRIMARY KEY,
      name varchar(64) NOT NULL,
      filter_name varchar(64) NOT NULL,
      sort_order integer NOT NULL
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
      DROP TABLE regions
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
