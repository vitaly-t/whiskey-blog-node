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

    const cmd = `INSERT INTO drink_types(
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
  return db.one('SELECT * FROM drink_types WHERE id = $1', id);
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
        const data = Object.assign(existingData, newData),
              cmd = `UPDATE drink_types SET
                      singular = $(singular),
                      plural = $(plural)
                    WHERE id = $(id)
                    RETURNING
                      id,
                      singular,
                      plural`;
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
