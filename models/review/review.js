'use strict';

const db = require('../_db').db,
      validation = require('../../helpers/validation'),
      where = require('../../helpers/where').where,
      slugFromString = require('../../helpers/slug').fromString,
      User = require('../user/user'),
      Distillery = require('../distillery/distillery'),
      Region = require('../region/region'),
      DrinkType = require('../drink-type/drink-type'),
      Rarity = require('../rarity/rarity');


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

    const cmd = `
      INSERT INTO reviews(
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
  // collect all these joins into a single query to avoid multiple chained
  // operations
  const cmd = `
    SELECT json_build_object(
      'id', reviews.id,
      'title', reviews.title,
      'subtitle', reviews.subtitle,
      'slug', reviews.slug,
      'created_at', reviews.created_at,
      'published_at', reviews.published_at,
      'summary', reviews.summary,
      'body', reviews.body,
      'proof_min', reviews.proof_min,
      'proof_max', reviews.proof_max,
      'age_min', reviews.age_min,
      'age_max', reviews.age_max,
      'manufacturer_price', reviews.manufacturer_price,
      'realistic_price', reviews.realistic_price,
      'mashbill_description', reviews.mashbill_description,
      'mashbill_recipe', reviews.mashbill_recipe,
      'rating', reviews.rating,
      'author', (SELECT json_build_object(
          'id', users.id,
          'name', users.name,
          'username', users.username,
          'access_level', users.access_level
        ) FROM users WHERE users.id = reviews.author),
      'distillery', (SELECT json_build_object(
          'id', distilleries.id,
          'name', distilleries.name
        ) FROM distilleries WHERE distilleries.id = reviews.distillery),
      'region', (SELECT json_build_object(
          'id', regions.id,
          'name', regions.name,
          'filter_name', regions.filter_name
        ) FROM regions WHERE regions.id = reviews.region),
      'drink_type', (SELECT json_build_object(
          'id', drink_types.id,
          'singular', drink_types.singular,
          'plural', drink_types.plural
        ) FROM drink_types WHERE drink_types.id = reviews.drink_type),
      'rarity', (SELECT json_build_object(
          'id', rarities.id,
          'name', rarities.name,
          'filter_name', rarities.filter_name
        ) FROM rarities WHERE rarities.id = reviews.rarity),
      'related_reviews', (SELECT json_agg(json_build_object(
          'id', rel_r.id,
          'title', rel_r.title,
          'subtitle', rel_r.subtitle,
          'slug', rel_r.slug,
          'summary', rel_r.summary
        )) FROM reviews rel_r INNER JOIN reviews_related_reviews
          ON reviews_related_reviews.origin = reviews.id
          AND reviews_related_reviews.related = rel_r.id),
      'related_posts', (SELECT json_agg(json_build_object(
          'id', rel_p.id,
          'title', rel_p.title,
          'slug', rel_p.slug,
          'summary', rel_p.summary
        )) FROM posts rel_p INNER JOIN reviews_related_posts
          ON reviews_related_posts.origin = reviews.id
          AND reviews_related_posts.related = rel_p.id)
    )
    FROM reviews WHERE $1~ = $2
  `;

  return db.oneOrNone(cmd, [columnName, value]).then(data => {
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
        const cmd = `
          UPDATE reviews SET
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
  return db.none('DELETE FROM reviews WHERE reviews.id = $1', id);
};
