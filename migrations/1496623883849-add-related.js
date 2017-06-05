'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE reviews_related_reviews(
      id SERIAL PRIMARY KEY,
      origin integer REFERENCES reviews(id) ON DELETE CASCADE,
      related integer REFERENCES reviews(id) ON DELETE CASCADE
    )
    `)
    .then(() => db.none(`
      CREATE TABLE reviews_related_posts(
        id SERIAL PRIMARY KEY,
        origin integer REFERENCES reviews(id) ON DELETE CASCADE,
        related integer REFERENCES posts(id) ON DELETE CASCADE
      )
    `))
    .then(() => db.none(`
      CREATE TABLE posts_related_reviews(
        id SERIAL PRIMARY KEY,
        origin integer REFERENCES posts(id) ON DELETE CASCADE,
        related integer REFERENCES reviews(id) ON DELETE CASCADE
      )
    `))
    .then(() => db.none(`
      CREATE TABLE posts_related_posts(
        id SERIAL PRIMARY KEY,
        origin integer REFERENCES posts(id) ON DELETE CASCADE,
        related integer REFERENCES posts(id) ON DELETE CASCADE
      )
    `))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};

exports.down = function(next) {
  db.none('DROP TABLE reviews_related_reviews')
    .then(() => db.none('DROP TABLE reviews_related_posts'))
    .then(() => db.none('DROP TABLE posts_related_reviews'))
    .then(() => db.none('DROP TABLE posts_related_posts'))
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
