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
        return exports.createRelated(stored.id, data.related_reviews, data.related_posts);
      })
      .then(() => resolve(stored))
      .catch(e => reject(e));
  });
};

// handles the query for all single-item `get` functions
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

    // pg-promise doesn't seem to recognize dates returned in json,
    // therefore parse these explicitly
    result.created_at = new Date(result.created_at);
    result.published_at = new Date(result.published_at);
    return result;
  });
}

// get a deeply-nested review by id
exports.get = function (id) {
  return getBy('id', id);
};

// get a deeply-nested review by url slug
exports.getBySlug = function (slug) {
  return getBy('slug', slug);
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
