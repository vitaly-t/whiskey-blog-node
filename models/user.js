const db = require('../models/_db').db,
      bcrypt = require('bcrypt');

// create a new user
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    if (!data.name || !data.username || !data.password_hash || typeof data.access_level != 'number' || data.access_level < 0) {
      reject('Invalid data when attempting create user');
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
                 ) RETURNING id`;

    db.one(cmd, data)
      .then(data => resolve(data))
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

// get user by id from Promise data
exports.getFromData = function (data) {
  return exports.get(data.id);
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
    exports.get(id)
      .then(existingData => {
        const data = Object.assign(existingData, newData),
              cmd = `UPDATE users SET
                      name = $(name),
                      username = $(username),
                      password_hash = $(password_hash),
                      access_level = $(access_level)
                    WHERE id = $(id)
                    RETURNING id`;
        db.one(cmd, data)
          .then(data => resolve(data))
          .catch(e => reject(e));
      })
      .catch(e => reject(e));
  });
};

// hash a password
exports.createHash = function (cleartext) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(cleartext, 13, (err, hash) => {
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
