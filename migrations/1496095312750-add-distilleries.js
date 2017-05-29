'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE distilleries(
      id SERIAL PRIMARY KEY,
      name varchar(128) UNIQUE NOT NULL,
      state varchar(64),
      city varchar(128),
      region varchar(128)
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
      DROP TABLE distilleries
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
