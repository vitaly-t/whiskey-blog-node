'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE distilleries DROP COLUMN region')
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE distilleries ADD COLUMN region varchar(128)')
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
