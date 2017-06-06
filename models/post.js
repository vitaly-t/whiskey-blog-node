'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation'),
      where = require('../helpers/where').where,
      slugFromString = require('../helpers/slug').fromString,
      User = require('./user');


/*
 * Post.validate: validates a set of post data
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
 * Post.create: creates and stores and new Post
 *
 * returns a Promise which, when resolved, will have stored this Post
 *
 * data (object): fields (as keys) and their values
 */

exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create post: ${validation.message}`);
    }

    let stored;

    const cmd = `
      INSERT INTO posts(
        title,
        slug,
        published_at,
        author,
        summary,
        body
      ) VALUES (
        $(title),
        $(slug),
        $(published_at),
        $(author),
        $(summary),
        $(body)
      ) RETURNING
        id,
        title,
        slug,
        created_at,
        published_at,
        author,
        summary,
       body`;

    const defaultData = {
      title: null,
      slug: function () {
        return slugFromString(this.title);
      },
      published_at: new Date(),
      author: null,
      summary: null,
      body: null,
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
 * createRelated: utility function to store Post relations
 *
 * returns a Promise which, when resolved, will return no data
 *
 * origin (integer): the id of the Post to which to add relations
 * reviews (array of integers): ids of related Reviews
 * posts (array of integers): ids of related Posts
 */

function createRelated(origin, reviews, posts) {

  // first, wipe out existing (avoiding update checks for now)
  return db.none(`DELETE FROM posts_related_reviews WHERE origin = $1`, origin)
    .then(() => db.none(`DELETE FROM posts_related_posts WHERE origin = $1`, origin))
    .then(() => {
      let ops = [];
      if (reviews) {
        ops.concat(reviews.map(review => db.none(`
          INSERT INTO posts_related_reviews(
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
          INSERT INTO posts_related_posts(
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
 * getBy: utility function that constructs the query to get a deeply-nested Post
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * columnName (string): the name of the db column on which to search. Better if
 *   values for this column are unique
 * value (variable, native type): the value by which to identify this Post
 */

function getBy(columnName, value) {
  // collect all these joins into a single query to avoid multiple chained
  // operations
  const cmd = `
    SELECT json_build_object(
      'id', posts.id,
      'title', posts.title,
      'slug', posts.slug,
      'created_at', posts.created_at,
      'published_at', posts.published_at,
      'summary', posts.summary,
      'body', posts.body,
      'author', (SELECT json_build_object(
          'id', users.id,
          'name', users.name,
          'username', users.username,
          'access_level', users.access_level
        ) FROM users WHERE users.id = posts.author),
      'related_reviews', (SELECT json_agg(json_build_object(
          'id', rel_r.id,
          'title', rel_r.title,
          'subtitle', rel_r.subtitle,
          'slug', rel_r.slug,
          'summary', rel_r.summary
        )) FROM reviews rel_r INNER JOIN posts_related_reviews
          ON posts_related_reviews.origin = posts.id
          AND posts_related_reviews.related = rel_r.id),
      'related_posts', (SELECT json_agg(json_build_object(
          'id', rel_p.id,
          'title', rel_p.title,
          'slug', rel_p.slug,
          'summary', rel_p.summary
        )) FROM posts rel_p INNER JOIN posts_related_posts
          ON posts_related_posts.origin = posts.id
          AND posts_related_posts.related = rel_p.id)
    )
    FROM posts WHERE $1~ = $2
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


/*
 * Post.get: fetches a single Post by id
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
 * Post.getBySlug: fetches a single Post by url slug
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data, deeply-nested where joined
 *
 * slug (string): unique url slug on which to search
 */

exports.getBySlug = function (slug) {
  return getBy('slug', slug);
};


/* Post.list: gets many posts, optionally paged, ordered, and filtered
 *
 * returns a Promise which, when resolved, will produce an array of objects,
 * each representing one Post (no joins)
 *
 * options (object): an object of parameters:
 *   page (integer): the page of Posts to fetch. Default 1
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
      cmd = 'SELECT * FROM posts';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};


/*
 * Post.alter: changes any amount of data for a single Post
 *
 * returns a Promise which, when resolved, will produce an object with the most
 * current data of this Post
 *
 * id (integer): the id of the Post to alter
 * newData (object): any number of fields (keys) to update with their new values
 */

exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData, true);
    if (validation.result === false) {
      reject(`Failed to alter post: ${validation.message}`);
    }

    let stored;

    exports.get(id)
      .then(existingData => {
        const cmd = `
          UPDATE posts SET
            title = $(title),
            slug = $(slug),
            published_at = $(published_at),
            author = $(author),
            summary = $(summary),
            body = $(body)
          WHERE id = $(id)
          RETURNING
            id,
            title,
            slug,
            created_at,
            published_at,
            author,
            summary,
            body`;

        // returned related objects have been expanded, and we can't reassign them in that state
        for (let relation of ['author', 'related_reviews', 'related_posts']) {
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
 * Post.delete: removed a Post from the db
 *
 * returns a Promise which, when resolved, will produce no data
 *
 * id (integer): the id of the Post to delete
 */

exports.delete = function (id) {
  return db.none('DELETE FROM posts WHERE posts.id = $1', id);
};
