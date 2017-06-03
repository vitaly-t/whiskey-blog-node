'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE reviews ADD COLUMN slug varchar(128) UNIQUE NOT NULL')
  	.then(() => db.none('ALTER TABLE posts ADD COLUMN slug varchar(128) UNIQUE NOT NULL'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE reviews DROP COLUMN slug')
  	.then(() => db.none('ALTER TABLE posts DROP COLUMN slug'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
