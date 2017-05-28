const db = require('../models/_db').db;

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

exports.find = function (data) {
  return new Promise((resolve, reject) => {
    let facets = [];
    if (Object.keys(data).length === 0) {
      reject('No data passed to User.find');
    }
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'number' ||
          typeof data[key] === 'boolean') {
        facets.push(key + ' = ' + data[key]);
      } else {
        facets.push(key + " = '" + data[key] + "'");
      }
    }
    db.any('SELECT * FROM users WHERE ' + facets.join(' AND '))
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
exports.createHash = function () {

};

// check a password
exports.checkPassword = function () {

};

// remove a user
exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    db.none('DELETE FROM users WHERE users.id = $1', id)
      .then(() => resolve())
      .catch(e => reject(e));
  });
};
