'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE reviews DROP COLUMN proof')
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN proof_min real'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN proof_max real'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN age'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN age_min real'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN age_max real'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE reviews DROP COLUMN age_max')
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN age_min'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN age real'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN proof_max'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN proof_min'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN proof real'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
