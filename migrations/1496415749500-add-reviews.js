'use strict';

const db = require('../models/_db').db;

exports.up = function(next) {
  db.none(`
    CREATE TABLE reviews(
      id SERIAL PRIMARY KEY,
      title varchar(512) NOT NULL,
      subtitle varchar(512),
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      published_at timestamp with time zone NOT NULL DEFAULT now(),
      author integer REFERENCES users(id) NOT NULL,
      summary text,
      body text,
      distillery integer REFERENCES distilleries(id),
      region integer REFERENCES regions(id),
      drink_type integer REFERENCES drink_types(id),
      rarity integer REFERENCES rarities(id),
      proof real,
      age real,
      manufacturer_price real,
      realistic_price varchar(256),
      mashbill_description varchar(512),
      mashbill_recipe varchar(512),
      rating real
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
      DROP TABLE reviews
    `)
    .then(next)
    .catch(e => {
      console.error(e);
      next();
    });
};
