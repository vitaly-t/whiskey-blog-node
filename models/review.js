'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation'),
      where = require('../helpers/where').where,
      slugFromString = require('../helpers/slug').fromString,
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
    slug: {
      types: ['string'],
      minLength: 1,
      maxLength: 128,
      regex: /^[a-zA-Z][a-zA-Z0-9\-]*$/
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
    proof_min: {
      types: ['number'],
      min: 0,
      max: 200,
      lte: 'proof_max'
    },
    proof_max: {
      types: ['number'],
      min: 0,
      max: 200,
      gte: 'proof_min'
    },
    age_min: {
      types: ['number'],
      min: 0,
      max: 100,
      lte: 'age_max'
    },
    age_max: {
      types: ['number'],
      min: 0,
      max: 100,
      gte: 'age_min'
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
    },
    related_reviews: {
      types: ['array'],
      elementTypes: ['number']
    },
    related_posts: {
      types: ['array'],
      elementTypes: ['number']
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

    let stored;

    const cmd = `INSERT INTO reviews(
                   title,
                   subtitle,
                   slug,
                   published_at,
                   author,
                   summary,
                   body,
                   distillery,
                   region,
                   drink_type,
                   rarity,
                   proof_min,
                   proof_max,
                   age_min,
                   age_max,
                   manufacturer_price,
                   realistic_price,
                   mashbill_description,
                   mashbill_recipe,
                   rating
                 ) VALUES (
                   $(title),
                   $(subtitle),
                   $(slug),
                   $(published_at),
                   $(author),
                   $(summary),
                   $(body),
                   $(distillery),
                   $(region),
                   $(drink_type),
                   $(rarity),
                   $(proof_min),
                   $(proof_max),
                   $(age_min),
                   $(age_max),
                   $(manufacturer_price),
                   $(realistic_price),
                   $(mashbill_description),
                   $(mashbill_recipe),
                   $(rating)
                 ) RETURNING
                   id,
                   title,
                   subtitle,
                   slug,
                   created_at,
                   published_at,
                   author,
                   summary,
                   body,
                   distillery,
                   region,
                   drink_type,
                   rarity,
                   proof_min,
                   proof_max,
                   age_min,
                   age_max,
                   manufacturer_price,
                   realistic_price,
                   mashbill_description,
                   mashbill_recipe,
                   rating`;


    const defaultData = {
      title: null,
      subtitle: null,
      slug: function () {
        return slugFromString(this.title + ' ' + (this.subtitle || ''));
      },
      published_at: new Date(),
      author: null,
      summary: null,
      body: null,
      distillery: null,
      region: null,
      drink_type: null,
      rarity: null,
      proof_min: null,
      proof_max: null,
      age_min: null,
      age_max: null,
      manufacturer_price: null,
      realistic_price: null,
      mashbill_description: null,
      mashbill_recipe: null,
      rating: null
    }

    data = Object.assign(defaultData, data);

    db.one(cmd, data)
      .then(returned => {
        stored = returned;
        return exports.createRelated(stored.id, data.related_reviews, data.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};

// get a deeply-nested review by id
exports.get = function (id) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object. refactor to do
  // in a single tx if ever porting this to Review.list()
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
      return exports.getRelatedReviews(result.id);
    })
    .then(relatedReviews => {
      result.related_reviews = relatedReviews;
      return exports.getRelatedPosts(result.id);
    })
    .then(relatedPosts => {
      result.related_posts = relatedPosts;
      return result;
    });
};

// get a deeply-nested review by url slug
exports.getBySlug = function (slug) {
  let result;

  // pg-promise doesn't automatically map joins to nested objects, so we're
  // doing this thing manually when getting a single object
  return db.oneOrNone('SELECT * FROM reviews WHERE reviews.slug = $1', slug)
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
      return exports.getRelatedReviews(result.id);
    })
    .then(relatedReviews => {
      result.related_reviews = relatedReviews;
      return exports.getRelatedPosts(result.id);
    })
    .then(relatedPosts => {
      result.related_posts = relatedPosts;
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

    let stored;

    exports.get(id)
      .then(existingData => {
        const cmd = `UPDATE reviews SET
                      title = $(title),
                      subtitle = $(subtitle),
                      slug = $(slug),
                      published_at = $(published_at),
                      author = $(author),
                      summary = $(summary),
                      body = $(body),
                      distillery = $(distillery),
                      region = $(region),
                      drink_type = $(drink_type),
                      rarity = $(rarity),
                      proof_min = $(proof_min),
                      proof_max = $(proof_max),
                      age_min = $(age_min),
                      age_max = $(age_max),
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
                      slug,
                      created_at,
                      published_at,
                      author,
                      summary,
                      body,
                      distillery,
                      region,
                      drink_type,
                      rarity,
                      proof_min,
                      proof_max,
                      age_min,
                      age_max,
                      manufacturer_price,
                      realistic_price,
                      mashbill_description,
                      mashbill_recipe,
                      rating`;

        // returned related objects have been expanded, and we can't reassign them in that state
        for (let relation of ['author', 'distillery', 'region', 'drink_type', 'rarity', 'related_reviews', 'related_posts']) {
          if (existingData[relation] && typeof existingData[relation] === 'object') {
            existingData[relation] = existingData[relation].id;
          } else if (typeof existingData[relation] === 'undefined') {
            existingData[relation] = null;
          }
        }

        newData = Object.assign(existingData, newData);

        return db.one(cmd, newData);
      })
      .then(returned => {
        stored = returned;
        return exports.createRelated(stored.id, newData.related_reviews, newData.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};

// remove a review
exports.delete = function (id) {
  return db.none('DELETE FROM reviews WHERE reviews.id = $1', id);
};

// add related data to their respective tables
exports.createRelated = function (origin, reviews, posts) {

  // first, wipe out existing (avoiding update checks for now)
  return db.none(`DELETE FROM reviews_related_reviews WHERE origin = $1`, origin)
    .then(() => db.none(`DELETE FROM reviews_related_posts WHERE origin = $1`, origin))
    .then(() => {
      let ops = [];
      if (reviews) {
        ops.concat(reviews.map(review => db.none(`
          INSERT INTO reviews_related_reviews(
            origin,
            related
          ) VALUES (
            $1,
            $2
          )
        `, [origin, review])));
      }
      if (posts) {
        ops.concat(posts.map(post => db.none(`
          INSERT INTO reviews_related_posts(
            origin,
            related
          ) VALUES (
            $1,
            $2
          )
        `, [origin, post])));
      }
      return Promise.all(ops);
    });
};

// fetch related reviews
exports.getRelatedReviews = function (id) {
  return db.any(`SELECT
                  reviews.id,
                  reviews.title,
                  reviews.subtitle,
                  reviews.slug,
                  reviews.summary
                FROM reviews_related_reviews
                INNER JOIN reviews
                  ON reviews_related_reviews.origin = $1
                  AND reviews_related_reviews.related = reviews.id`, id);
};

// fetch related posts
exports.getRelatedPosts = function (id) {
  return db.any(`SELECT
                  posts.id,
                  posts.title,
                  posts.slug,
                  posts.summary
                FROM reviews_related_posts
                INNER JOIN posts
                  ON reviews_related_posts.origin = $1
                  AND reviews_related_posts.related = posts.id`, id);
};
