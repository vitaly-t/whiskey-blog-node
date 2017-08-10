'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE reviews ADD COLUMN is_published boolean')
    .then(() => db.none('ALTER TABLE posts ADD COLUMN is_published boolean'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE reviews DROP COLUMN is_published')
    .then(() => db.none('ALTER TABLE posts DROP COLUMN is_published'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
