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

// create a new rarity
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['name', 'filter_name', 'sort_order']);
    if (validation.result === false) {
      reject(`Failed to create rarity: ${validation.message}`);
    }

    const cmd = `INSERT INTO rarities(
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

// get a rarity by id
exports.get = function (id) {
  return db.one('SELECT * FROM rarities WHERE id = $1', id);
};

// change a rarity
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter rarity: ${validation.message}`);
    }

    exports.get(id)
      .then(existingData => {
        const data = Object.assign(existingData, newData),
              cmd = `UPDATE rarities SET
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

// remove a rarity
exports.delete = function (id) {
  return db.none('DELETE FROM rarities WHERE rarities.id = $1', id);
};
