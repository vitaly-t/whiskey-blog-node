'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation');

exports.validate = function (data, required) {
  const schema = {
    singular: {
      types: ['string'],
      minLength: 1,
      maxLength: 64
    },
    plural: {
      types: ['string'],
      minLength: 1,
      maxLength: 64
    }
  };

  return validation.validate(data, schema, required);
}

// create a new drink type
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['singular', 'plural']);
    if (validation.result === false) {
      reject(`Failed to create drink type: ${validation.message}`);
    }

    const cmd = `
      INSERT INTO drink_types(
        singular,
        plural
      ) VALUES (
        $(singular),
        $(plural)
      ) RETURNING
        id,
        singular,
        plural`;

    db.one(cmd, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get a drink type by id
exports.get = function (id) {
  return db.oneOrNone('SELECT * FROM drink_types WHERE id = $1', id);
};

// list drink types, with options to page, order, and filter
exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'singular',
    order: 'ASC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM drink_types';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};

// change a drink type
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter drink type: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const cmd = `
          UPDATE drink_types SET
            singular = $(singular),
            plural = $(plural)
          WHERE id = $(id)
          RETURNING
            id,
            singular,
            plural`,
          data = Object.assign(existingData, newData);
        return db.one(cmd, data);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// remove a drink type
exports.delete = function (id) {
  return db.none('DELETE FROM drink_types WHERE drink_types.id = $1', id);
};
