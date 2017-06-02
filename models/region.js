'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation');

exports.validate = function (data, required) {
  const schema = {
    name: {
      types: ['string'],
      minLength: 1,
      maxLength: 64
    },
    filter_name: {
      types: ['string'],
      minLength: 1,
      maxLength: 64
    },
    sort_order: {
      types: ['number'],
      step: 1
    }
  };

  return validation.validate(data, schema, required);
}

// create a new region
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['name', 'filter_name', 'sort_order']);
    if (validation.result === false) {
      reject(`Failed to create region: ${validation.message}`);
    }

    const cmd = `INSERT INTO regions(
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

// get a region by id
exports.get = function (id) {
  return db.oneOrNone('SELECT * FROM regions WHERE id = $1', id);
};

// list regions, with options to page, order, and filter
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

// change a region
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter region: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const data = Object.assign(existingData, newData),
              cmd = `UPDATE regions SET
                      name = $(name),
                      filter_name = $(filter_name),
                      sort_order = $(sort_order)
                    WHERE id = $(id)
                    RETURNING
                      id,
                      name,
                      filter_name,
                      sort_order`;
        return db.one(cmd, data);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// remove a region
exports.delete = function (id) {
  return db.none('DELETE FROM regions WHERE regions.id = $1', id);
};
