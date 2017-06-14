'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE posts ADD COLUMN subtitle varchar(512)')
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE posts DROP COLUMN subtitle')
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
