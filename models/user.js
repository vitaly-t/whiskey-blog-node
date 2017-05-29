const db = require('../models/_db').db,
      bcrypt = require('bcrypt');

// create a new user
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    if (!data.name || !data.username || !data.password || typeof data.access_level != 'number' || data.access_level < 0) {
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
