'use strict';

const db = require('../_db').db,
      validation = require('../../helpers/validation'),
      where = require('../../helpers/where').where,
      slugFromString = require('../../helpers/slug').fromString,
      User = require('../user/user'),
      Distillery = require('../distillery/distillery'),
      Region = require('../region/region'),
      DrinkType = require('../drink-type/drink-type'),
      Rarity = require('../rarity/rarity'),

      // load sql queries for pg-promise
      QueryFile = require('pg-promise').QueryFile,
      qfOptions = { minify: true },
      sqlCreate = new QueryFile(__dirname + '/_create.sql', qfOptions),
      sqlGetBy = new QueryFile(__dirname + '/_getBy.sql', qfOptions),
      sqlAlter = new QueryFile(__dirname + '/_alter.sql', qfOptions),
      sqlDelete = new QueryFile(__dirname + '/_delete.sql', qfOptions),
      sqlCreateRelatedReview = new QueryFile(__dirname + '/_create-related-review.sql', qfOptions),
      sqlCreateRelatedPost = new QueryFile(__dirname + '/_create-related-post.sql', qfOptions),
      sqlDeleteRelatedReviews = new QueryFile(__dirname + '/_delete-related-reviews.sql', qfOptions),
      sqlDeleteRelatedPosts = new QueryFile(__dirname + '/_delete-related-posts.sql', qfOptions);


/*
 * Review.validate: validates a set of review data
 *
 * returns an object:
 *   result: `true` if validation passed, `false` if not
 *   message: reason for producing said result
 *
 * data (object): fields (as keys) and their values
 * suppressRequired (boolean): ignore `required` fields in schema definition.
 *   Useful for testing individual fields
 */

exports.validate = function (data, suppressRequired) {
  const schema = {
    title: {
      types: ['string'],
      minLength: 1,
      maxLength: 512,
      required: true
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
      step: 1,
      required: true
    },
    summary: {
      types: ['string'],
      minLength: 1
    },
    body: {
      types: ['string'],
      minLength: 1,
      required: true
    },
    main_image: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    side_image: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    home_image: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
    },
    list_image: {
      types: ['string'],
      minLength: 1,
      maxLength: 512
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

  return validation.validate(data, schema, suppressRequired);
}


/*
 * Review.create: creates and stores and new Review
 *
 * returns a Promise which, when resolved, will have stored this Review
 *
 * data (object): fields (as keys) and their values
 */

exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create review: ${validation.message}`);
    }

    let stored;

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
      main_image: null,
      side_image: null,
      home_image: null,
      list_image: null,
      distillery: null,
      region: null,
      drink_type: null,
      rarity: null,
      proof_min: null,
      proof_max: null,
      age_min: 0,
      age_max: 0,
      manufacturer_price: null,
      realistic_price: null,
      mashbill_description: null,
      mashbill_recipe: null,
      rating: null
    }

    data = Object.assign(defaultData, data);

    db.one(sqlCreate, data)
      .then(returned => {
        stored = returned;
        return createRelated(stored.id, data.related_reviews, data.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};


/*
 * createRelated: utility function to store Review relations
 *
 * returns a Promise which, when resolved, will return no data
 *
 * origin (integer): the id of the Review to which to add relations
 * reviews (array of integers): ids of related Reviews
 * posts (array of integers): ids of related Posts
 */

function createRelated(origin, reviews, posts) {

  // first, wipe out existing (avoiding update checks for now)
  return db.none(sqlDeleteRelatedReviews, origin)
    .then(() => db.none(sqlDeleteRelatedPosts, origin))
    .then(() => {
      let ops = [];
      if (reviews) {
        ops.concat(reviews.map(review => db.none(sqlCreateRelatedReview, [origin, review])));
      }
      if (posts) {
        ops.concat(posts.map(post => db.none(sqlCreateRelatedPost, [origin, post])));
      }
      return Promise.all(ops);
    });
};


/*
 * getBy: utility function that constructs the query to get a deeply-nested Review
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * columnName (string): the name of the db column on which to search. Better if
 *   values for this column are unique
 * value (variable, native type): the value by which to identify this Review
 */

function getBy(columnName, value) {
  return db.oneOrNone(sqlGetBy, [columnName, value]).then(data => {
    let result = data.json_build_object;

    // we have to parse these returned timestamps explicitly
    result.created_at = new Date(result.created_at);
    result.published_at = new Date(result.published_at);
    return result;
  });
}


/*
 * Review.get: fetches a single Review by id
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data, deeply-nested where joined
 *
 * id (integer): id of row in db
 */

exports.get = function (id) {
  return getBy('id', id);
};


/*
 * Review.getBySlug: fetches a single Review by url slug
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data, deeply-nested where joined
 *
 * slug (string): unique url slug on which to search
 */

exports.getBySlug = function (slug) {
  return getBy('slug', slug);
};


/* Review.list: gets many reviews, optionally paged, ordered, and filtered
 *
 * returns a Promise which, when resolved, will produce an array of objects,
 * each representing one Review (no joins)
 *
 * options (object): an object of parameters:
 *   page (integer): the page of reviews to fetch. Default 1
 *   limit (integer): number of items per page. Default 100
 *   orderBy (string): name of the column to sort on. Default: 'published_at'
 *   order (string): 'ASC' or 'DESC'. Default 'DESC'
 *   filters (array of objects): any number of filters to be joined via AND op
 *     field (string): the column to filter on
 *     comparison (string): 'gt', 'gte', 'lt', 'lte'. If blank, defaults to =
 *     value: (variable, native type): value on which to apply the comparison
 */

exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'published_at',
    order: 'DESC',
    offset: a => (a.page - 1) * a.limit,
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM reviews';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  if (params.orderBy === 'random') {
    cmd += ' ORDER BY random()';
  } else {
    cmd += ' ORDER BY $(orderBy~) $(order^)';
  }

  cmd += ' LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};


/*
 * Review.alter: changes any amount of data for a single Review
 *
 * returns a Promise which, when resolved, will produce an object with the most
 * current data of this Review
 *
 * id (integer): the id of the Review to alter
 * newData (object): any number of fields (keys) to update with their new values
 */

exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData, true);
    if (validation.result === false) {
      reject(`Failed to alter review: ${validation.message}`);
    }

    let stored;

    exports.get(id)
      .then(existingData => {
        // returned related objects have been expanded, and we can't reassign them in that state
        for (let relation of ['author', 'distillery', 'region', 'drink_type', 'rarity', 'related_reviews', 'related_posts']) {
          if (existingData[relation] && typeof existingData[relation] === 'object') {
            existingData[relation] = existingData[relation].id;
          } else if (typeof existingData[relation] === 'undefined') {
            existingData[relation] = null;
          }
        }

        newData = Object.assign(existingData, newData);

        return db.one(sqlAlter, newData);
      })
      .then(returned => {
        stored = returned;
        return createRelated(stored.id, newData.related_reviews, newData.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};


/*
 * Review.delete: removed a Review from the db
 *
 * returns a Promise which, when resolved, will produce no data
 *
 * id (integer): the id of the Review to delete
 */

exports.delete = function (id) {
  return db.none(sqlDelete, id);
};
