// creates base tables so I don't have to worry about it later

const db = require('../models/_db').db;

// drink types

// rarities

// distilleries

// users
const users = `CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name varchar(256) NOT NULL,
                username varchar(256) NOT NULL,
                password_hash varchar(60) NOT NULL,
                access_level integer NOT NULL
              )`;

// posts
const posts = `CREATE TABLE IF NOT EXISTS posts(
                id SERIAL PRIMARY KEY,
                title varchar(512) NOT NULL,
                time_created timestamp NOT NULL,
                time_published timestamp NOT NULL,
                author integer REFERENCES users (id) NOT NULL,
                summary text,
                body text,
                related_posts integer[],
                related_reviews integer[]
              )`;

// reviews

// pages

db.none(users).then(() => {
  console.log('users table created');
  db.none(posts).then(() => {
    console.log('posts table created');
  }).catch(e => console.error(e));
}).catch(e => console.error(e));
