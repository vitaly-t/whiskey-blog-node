'use strict';

const db = require('../models/_db').db,
      validation = require('../helpers/validation'),
      bcrypt = require('bcrypt');

exports.validate = function (data, required) {
  const schema = {
    name: {
      types: ['string'],
      minLength: 1,
      maxLength: 256
    },
    username: {
      types: ['string'],
      minLength: 6,
      maxLength: 256
    },
    password: {
      types: ['string'],
      minLength: 6
    },
    access_level: {
      types: ['number'],
      min: 0,
      step: 1
    }
  };

  return validation.validate(data, schema, required);
}

// create a new user
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data, ['name', 'username', 'password', 'access_level']);
    if (validation.result === false) {
      reject(`Failed to create user: ${validation.message}`);
    }

    const cmd = `INSERT INTO users(
                   name,
                   username,
                   password_hash,
                   access_level
                 ) VALUES (
                   $(name),
                   $(username),
                   $(password_hash),
                   $(access_level)
                 ) RETURNING
                   id,
                   name,
                   username,
                   password_hash,
                   access_level`;

    exports.createHash(data.password)
      .then(hash => {
        data.password_hash = hash;
        db.one(cmd, data)
          .then(data => resolve(data))
          .catch(e => reject(e));
      })
      .catch(e => reject(e));
  });
};

// get a user by id
exports.get = function (id) {
  return new Promise((resolve, reject) => {
    db.one('SELECT * FROM users WHERE id = $1', id)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// get user by arbitrary column(s)
exports.find = function (data) {
  return new Promise((resolve, reject) => {
    let facets = [];
    if (Object.keys(data).length === 0) {
      reject('No data passed to User.find');
    }
    // compile a WHERE clause based on named parameters
    for (const key of Object.keys(data)) {
      facets.push(key + ' = $(' + key +')');
    }
    db.any('SELECT * FROM users WHERE ' + facets.join(' AND '), data)
      .then(data => resolve(data))
      .catch(e => reject(e));
  });
};

// change a user's info
exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {
    function updateUser() {
      exports.get(id)
        .then(existingData => {
          const data = Object.assign(existingData, newData),
                cmd = `UPDATE users SET
                        name = $(name),
                        username = $(username),
                        password_hash = $(password_hash),
                        access_level = $(access_level)
                      WHERE id = $(id)
                      RETURNING
                        id,
                        name,
                        username,
                        password_hash,
                        access_level`;
          db.one(cmd, data)
            .then(data => resolve(data))
            .catch(e => reject(e));
        })
        .catch(e => reject(e));
    }

    const validation = exports.validate(newData);
    if (validation.result === false) {
      reject(`Failed to alter user: ${validation.message}`);
    }

    if (newData.password) {
      exports.createHash(newData.password)
        .then(hash => {
          newData.password_hash = hash;
          updateUser();
        })
        .catch(e => reject(e));
    } else {
      updateUser();
    }
  });
};

// hash a password
exports.createHash = function (cleartext) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(cleartext, 12, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
};

// check a password
exports.checkPassword = function (cleartext, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(cleartext, hash, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

// remove a user
exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    db.none('DELETE FROM users WHERE users.id = $1', id)
      .then(() => resolve())
      .catch(e => reject(e));
  });
};
