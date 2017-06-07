'use strict';

const db = require('../_db').db,
      validation = require('../../helpers/validation'),

      // load sql queries for pg-promise
      QueryFile = require('pg-promise').QueryFile,
      qfOptions = { minify: true },
      sqlCreate = new QueryFile(__dirname + '/_create.sql', qfOptions),
      sqlGet = new QueryFile(__dirname + '/_get.sql', qfOptions),
      sqlAlter = new QueryFile(__dirname + '/_alter.sql', qfOptions),
      sqlDelete = new QueryFile(__dirname + '/_delete.sql', qfOptions);


/*
 * Region.validate: validates a set of region data
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
    name: {
      types: ['string'],
      minLength: 1,
      maxLength: 64,
      required: true
    },
    filter_name: {
      types: ['string'],
      minLength: 1,
      maxLength: 64,
      required: true
    },
    sort_order: {
      types: ['number'],
      step: 1,
      required: true
    }
  };

  return validation.validate(data, schema, suppressRequired);
}


/*
 * Region.create: creates and stores and new Region
 *
 * returns a Promise which, when resolved, will have stored this Region
 *
 * data (object): fields (as keys) and their values
 */

exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create region: ${validation.message}`);
    }

    db.one(sqlCreate, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};


/*
 * Region.get: fetches a single Region by id
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * id (integer): id of row in db
 */

exports.get = function (id) {
  return db.oneOrNone(sqlGet, id);
};


/* Region.list: gets many regions, optionally paged, ordered, and filtered
 *
 * returns a Promise which, when resolved, will produce an array of objects,
 * each representing one Region (no joins)
 *
 * options (object): an object of parameters:
 *   page (integer): the page of regions to fetch. Default 1
 *   limit (integer): number of items per page. Default 100
 *   orderBy (string): name of the column to sort on. Default: 'sort_order'
 *   order (string): 'ASC' or 'DESC'. Default 'ASC'
 *   filters (array of objects): any number of filters to be joined via AND op
 *     field (string): the column to filter on
 *     comparison (string): 'gt', 'gte', 'lt', 'lte'. If blank, defaults to =
 *     value: (variable, native type): value on which to apply the comparison
 */

exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'sort_order',
    order: 'ASC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM regions';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};


/*
 * Region.alter: changes any amount of data for a single Region
 *
 * returns a Promise which, when resolved, will produce an object with the most
 * current data of this Region
 *
 * id (integer): the id of the Region to alter
 * newData (object): any number of fields (keys) to update with their new values
 */

exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData, true);
    if (validation.result === false) {
      reject(`Failed to alter region: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const data = Object.assign(existingData, newData)
        return db.one(sqlAlter, data);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};


/*
 * Region.delete: removed a Region from the db
 *
 * returns a Promise which, when resolved, will produce no data
 *
 * id (integer): the id of the Region to delete
 */

exports.delete = function (id) {
  return db.none(sqlDelete, id);
};
