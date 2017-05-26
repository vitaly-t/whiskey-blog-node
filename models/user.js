const db = require('../models/_db').db;

// create a new user
exports.create = function (data) {
  return new Promise((resolve, reject) => {
    if (!data.name || !data.username || !data.password_hash || typeof data.accessLevel != 'number' || data.accessLevel < 0) {
      reject('Invalid data when attempting create user');
    }

    const cmd = `INSERT INTO users(
                   name,
                   username,
                   password_hash,
                   access_level
                 ) VALUES (
                   $1, $2, $3, $4
                 ) RETURNING id`;

    db.one(cmd, [data.name, data.username, data.password_hash, data.accessLevel])
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

// find users by any criteria
exports.find = function () {

};

// change a user's info
exports.alter = function () {

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
