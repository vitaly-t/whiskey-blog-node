'use strict';

const db = require('../_db').db,
      validation = require('../../helpers/validation');


/*
 * Rarity.validate: validates a set of rarity data
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
 * Rarity.create: creates and stores and new Rarity
 *
 * returns a Promise which, when resolved, will have stored this Rarity
 *
 * data (object): fields (as keys) and their values
 */

exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create rarity: ${validation.message}`);
    }

    const cmd = `
      INSERT INTO rarities(
        name,
        filter_name,
        sort_order
      ) VALUES (
        $(name),
        $(filter_name),
        $(sort_order)
      ) RETURNING
        id,
        name,
        filter_name,
        sort_order`;

    db.one(cmd, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};


/*
 * Rarity.get: fetches a single Rarity by id
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * id (integer): id of row in db
 */

exports.get = function (id) {
  return db.oneOrNone('SELECT * FROM rarities WHERE id = $1', id);
};


/* Rarity.list: gets many rarities, optionally paged, ordered, and filtered
 *
 * returns a Promise which, when resolved, will produce an array of objects,
 * each representing one Rarity (no joins)
 *
 * options (object): an object of parameters:
 *   page (integer): the page of rarities to fetch. Default 1
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
      cmd = 'SELECT * FROM rarities';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};


/*
 * Rarity.alter: changes any amount of data for a single Rarity
 *
 * returns a Promise which, when resolved, will produce an object with the most
 * current data of this Rarity
 *
 * id (integer): the id of the Rarity to alter
 * newData (object): any number of fields (keys) to update with their new values
 */

exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData, true);
    if (validation.result === false) {
      reject(`Failed to alter rarity: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const cmd = `
          UPDATE rarities SET
            name = $(name),
            filter_name = $(filter_name),
            sort_order = $(sort_order)
          WHERE id = $(id)
          RETURNING
            id,
            name,
            filter_name,
            sort_order`,
          data = Object.assign(existingData, newData);
        return db.one(cmd, data);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};


/*
 * Rarity.delete: removed a Rarity from the db
 *
 * returns a Promise which, when resolved, will produce no data
 *
 * id (integer): the id of the Rarity to delete
 */

exports.delete = function (id) {
  return db.none('DELETE FROM rarities WHERE rarities.id = $1', id);
};
