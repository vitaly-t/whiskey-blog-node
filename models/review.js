'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation'),
      where = require('../helpers/where').where,
      User = require('./user'),
      Distillery = require('./distillery'),
      Region = require('./region'),
      DrinkType = require('./drink-type'),
      Rarity = require('./rarity');

exports.validate = function (data, required) {
  const schema = {
    title: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    subtitle: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    published_at: {
      types: ['date']
    },
    author: {
      types: ['number'],
      min: 0,
      step: 1
    },
    summary: {
      types: ['string'],
      minLength: 1
    },
    body: {
      types: ['string'],
      minLength: 1
    },
    distillery: {
      types: ['number'],
      min: 0,
      step: 1
    },
    region: {
      types: ['number'],
      min: 0,
      step: 1
    },
    drink_type: {
      types: ['number'],
      min: 0,
      step: 1
    },
    rarity: {
      types: ['number'],
      min: 0,
      step: 1
    },
    proof: {
      types: ['number'],
      min: 0,
      max: 200
    },
    age: {
      types: ['number'],
      min: 0,
      max: 100
    },
    manufacturer_price: {
      types: ['number'],
      min: 0,
      max: 999999.99
    },
    realistic_price: {
      types: ['string'],
      minLength: 1,
      maxLength: 256
    },
    mashbill_description: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    mashbill_recipe: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    rating: {
      types: ['number']
    }
  };

  return validation.validate(data, schema, required);
}

// create a new review
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['title', 'author', 'body']);
    if (validation.result === false) {
      reject(`Failed to create review: ${validation.message}`);
    }

    const cmd = `INSERT INTO reviews(
                   title,
                   subtitle,
                   published_at,
                   author,
                   summary,
                   body,
                   distillery,
                   region,
                   drink_type,
                   rarity,
                   proof,
                   age,
                   manufacturer_price,
                   realistic_price,
                   mashbill_description,
                   mashbill_recipe,
                   rating
                 ) VALUES (
                   $(title),
                   $(subtitle),
                   $(published_at),
                   $(author),
                   $(summary),
                   $(body),
                   $(distillery),
                   $(region),
                   $(drink_type),
                   $(rarity),
                   $(proof),
                   $(age),
                   $(manufacturer_price),
                   $(realistic_price),
                   $(mashbill_description),
                   $(mashbill_recipe),
                   $(rating)
                 ) RETURNING
                   id,
                   title,
                   subtitle,
                   created_at,
                   published_at,
                   author,
                   summary,
                   body,
                   distillery,
                   region,
                   drink_type,
                   rarity,
                   proof,
                   age,
                   manufacturer_price,
                   realistic_price,
                   mashbill_description,
                   mashbill_recipe,
                   rating`;


    const defaultData = {
      title: null,
      subtitle: null,
      published_at: new Date(),
      author: null,
      summary: null,
      body: null,
      distillery: null,
      region: null,
      drink_type: null,
      rarity: null,
      proof: null,
      age: null,
      manufacturer_price: null,
      realistic_price: null,
      mashbill_description: null,
      mashbill_recipe: null,
      rating: null
    }

    data = Object.assign(defaultData, data);

    db.one(cmd, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get a deeply-nested review by id
exports.get = function (id) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object
  return db.oneOrNone('SELECT * FROM reviews WHERE reviews.id = $1', id)
    .then(review => {
      result = review;
      return User.get(result.author);
    })
    .then(user => {
      result.author = user;
      return Distillery.get(result.distillery);
    })
    .then(distillery => {
      result.distillery = distillery;
      return Region.get(result.region);
    })
    .then(region => {
      result.region = region;
      return DrinkType.get(result.drink_type);
    })
    .then(drink_type => {
      result.drink_type = drink_type;
      return Rarity.get(result.rarity);
    })
    .then(rarity => {
      result.rarity = rarity;
      return result;
    });
};

// shallow list reviews, with options to page, order, and filter
exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'published_at',
    order: 'DESC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM reviews';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};

// change a review
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter review: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const cmd = `UPDATE reviews SET
                      title = $(title),
                      subtitle = $(subtitle),
                      published_at = $(published_at),
                      author = $(author),
                      summary = $(summary),
                      body = $(body),
                      distillery = $(distillery),
                      region = $(region),
                      drink_type = $(drink_type),
                      rarity = $(rarity),
                      proof = $(proof),
                      age = $(age),
                      manufacturer_price = $(manufacturer_price),
                      realistic_price = $(realistic_price),
                      mashbill_description = $(mashbill_description),
                      mashbill_recipe = $(mashbill_recipe),
                      rating = $(rating)
                    WHERE id = $(id)
                    RETURNING
                      id,
                      title,
                      subtitle,
                      created_at,
                      published_at,
                      author,
                      summary,
                      body,
                      distillery,
                      region,
                      drink_type,
                      rarity,
                      proof,
                      age,
                      manufacturer_price,
                      realistic_price,
                      mashbill_description,
                      mashbill_recipe,
                      rating`;

        // returned related objects have been expanded, and we can't reassign them in that state
        for (let relation of ['author', 'distillery', 'region', 'drink_type', 'rarity']) {
          if (existingData[relation] && typeof existingData[relation] === 'object') {
            existingData[relation] = existingData[relation].id;
          } else if (typeof existingData[relation] === 'undefined') {
            existingData[relation] = null;
          }
        }

        newData = Object.assign(existingData, newData);
        return db.one(cmd, newData);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// remove a review
exports.delete = function (id) {
  return db.none('DELETE FROM reviews WHERE reviews.id = $1', id);
};
