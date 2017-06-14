'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none('ALTER TABLE posts ADD COLUMN main_image varchar(512)')
    .then(() => db.none('ALTER TABLE posts ADD COLUMN side_image varchar(512)'))
    .then(() => db.none('ALTER TABLE posts ADD COLUMN home_image varchar(512)'))
    .then(() => db.none('ALTER TABLE posts ADD COLUMN list_image varchar(512)'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN main_image varchar(512)'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN side_image varchar(512)'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN home_image varchar(512)'))
    .then(() => db.none('ALTER TABLE reviews ADD COLUMN list_image varchar(512)'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('ALTER TABLE posts DROP COLUMN main_image')
    .then(() => db.none('ALTER TABLE posts DROP COLUMN side_image'))
    .then(() => db.none('ALTER TABLE posts DROP COLUMN home_image'))
    .then(() => db.none('ALTER TABLE posts DROP COLUMN list_image'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN main_image'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN side_image'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN home_image'))
    .then(() => db.none('ALTER TABLE reviews DROP COLUMN list_image'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
