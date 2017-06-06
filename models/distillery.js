'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation');

exports.validate = function (data, suppressRequired) {
  const schema = {
    name: {
      types: ['string'],
      minLength: 1,
      maxLength: 128,
      required: true
    },
    state: {
      types: ['string'],
      minLength: 1,
      maxLength: 64,
      required: true
    },
    city: {
      types: ['string'],
      minLength: 1,
      maxLength: 128,
      required: true
    }
  };

  return validation.validate(data, schema, suppressRequired);
}

// create a new distillery
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create distillery: ${validation.message}`);
    }

    const cmd = `
      INSERT INTO distilleries(
        name,
        state,
        city
      ) VALUES (
        $(name),
        $(state),
        $(city)
      ) RETURNING
        id,
        name,
        state,
        city`;

    db.one(cmd, data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get a distillery by id
exports.get = function (id) {
  return db.oneOrNone('SELECT * FROM distilleries WHERE id = $1', id);
};

// list distilleries, with options to page, order, and filter
exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'name',
    order: 'ASC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT * FROM distilleries';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};

// change a distillery
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData, true);
    if (validation.result === false) {
      reject(`Failed to alter distillery: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const cmd = `
          UPDATE distilleries SET
            name = $(name),
            state = $(state),
            city = $(city)
          WHERE id = $(id)
          RETURNING
            id,
            name,
            state,
            city`,
          data = Object.assign(existingData, newData);
        return db.one(cmd, data);
      })
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// remove a distillery
exports.delete = function (id) {
  return db.none('DELETE FROM distilleries WHERE distilleries.id = $1', id);
};
