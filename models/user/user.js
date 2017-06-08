'use strict';

const db = require('../_db').db,
      validation = require('../../helpers/validation'),
      where = require('../../helpers/where').where,
      bcrypt = require('bcrypt'),

      // load sql queries for pg-promise
      QueryFile = require('pg-promise').QueryFile,
      qfOptions = { minify: true },
      sqlCreate = new QueryFile(__dirname + '/_create.sql', qfOptions),
      sqlGetBy = new QueryFile(__dirname + '/_getBy.sql', qfOptions),
      sqlGetHash = new QueryFile(__dirname + '/_getHash.sql', qfOptions),
      sqlAlter = new QueryFile(__dirname + '/_alter.sql', qfOptions),
      sqlDelete = new QueryFile(__dirname + '/_delete.sql', qfOptions);


/*
 * User.validate: validates a set of user data
 *
 * returns an object:
 *   result: `true` if validation passed, `false` if not
 *   message: reason for producing said result
 *
 * note that here we're validating passwords and not hashes. Validation should
 * be performed before hashing
 *
 * data (object): fields (as keys) and their values
 * suppressRequired (boolean): ignore `required` fields in schema definition.
 *   Useful for testing individual fields
 */

exports.validate = function (data, suppressRequired) {
  const schema = {
    name: {
      types: ['string'],
      minLength: 1,
      maxLength: 256,
      required: true
    },
    username: {
      types: ['string'],
      minLength: 6,
      maxLength: 256,
      required: true
    },
    password: {
      types: ['string'],
      minLength: 6,
      required: true
    },
    access_level: {
      types: ['number'],
      min: 0,
      step: 1,
      required: true
    }
  };

  return validation.validate(data, schema, suppressRequired);
}


/*
 * User.create: creates and stores and new User
 *
 * returns a Promise which, when resolved, will have stored this User
 *
 * data (object): fields (as keys) and their values
 */

exports.create = function (data) {
  return new Promise((resolve, reject) => {
    const validation = exports.validate(data);
    if (validation.result === false) {
      reject(`Failed to create user: ${validation.message}`);
    }

    exports.createHash(data.password)
      .then(hash => {
        data.password_hash = hash;
        return db.one(sqlCreate, data)
          .then(data => resolve(data))
          .catch(e => reject(e));
      })
      .catch(e => reject(e));
  });
};


/*
 * getBy: utility function that constructs the query to get a user
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * columnName (string): the name of the db column on which to search. Better if
 *   values for this column are unique
 * value (variable, native type): the value by which to identify this User
 */

function getBy(columnName, value) {
  return db.oneOrNone(sqlGetBy, [columnName, value]);
}


/*
 * User.get: fetches a single User by id
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * id (integer): id of row in db
 */

exports.get = function (id) {
  return getBy('id', id);
};


/*
 * User.getByUsername: fetches a single User by username
 *
 * returns a Promise which, when resolved, will produce a single object's worth
 * of data
 *
 * username (string): unique username of user
 */

exports.getByUsername = function (username) {
  return getBy('username', username);
};


/*
 * getHash: utility function that fetches a user's password hash, as this data
 * is not made available by externally callable 'get' functions
 *
 * returns a 60-character string
 *
 * id (integer): the id of the user whose hash to fetch
 */

let getHash = function (id) {
  return new Promise((resolve, reject) => {
    db.one(sqlGetHash, id)
      .then(data => resolve(data.password_hash))
      .catch(e => reject(e));
  });
};


/* User.list: gets many users, optionally paged, ordered, and filtered
 *
 * returns a Promise which, when resolved, will produce an array of objects,
 * each representing one User (no joins)
 *
 * options (object): an object of parameters:
 *   page (integer): the page of users to fetch. Default 1
 *   limit (integer): number of items per page. Default 100
 *   orderBy (string): name of the column to sort on. Default: 'id'
 *   order (string): 'ASC' or 'DESC'. Default 'ASC'
 *   filters (array of objects): any number of filters to be joined via AND op
 *     field (string): the column to filter on
 *     comparison (string): 'gt', 'gte', 'lt', 'lte'. If blank, defaults to =
 *     value: (variable, native type): value on which to apply the comparison
 */

exports.list = function (options={}) {
  const defaults = {
    page: 1,
    limit: 100,
    orderBy: 'id',
    order: 'ASC',
    offset: function () {
      return (this.page - 1) * this.limit;
    },
    filters: []
  };

  let params = Object.assign(defaults, options),
      cmd = 'SELECT id, name, username, access_level FROM users';

  if (params.filters.length > 0) {
    cmd += where(params, 'filters');
  }

  cmd += ' ORDER BY $(orderBy~) $(order^) LIMIT $(limit) OFFSET $(offset)';

  return db.any(cmd, params);
};


/*
 * User.alter: changes any amount of data for a single User
 *
 * returns a Promise which, when resolved, will produce an object with the most
 * current data of this User
 *
 * id (integer): the id of the User to alter
 * newData (object): any number of fields (keys) to update with their new
 *   values. Note that password hash should not be directly updated with this
 *   method; pass the raw password instead and it will be hashed automatically
 */

exports.alter = function (id, newData) {
  return new Promise((resolve, reject) => {

    function updateUser() {
      let oldData;
      exports.get(id)
        .then(data => {
          oldData = data;
          return getHash(id);
        })
        .then(hash => {
          oldData.password_hash = hash;
          let data = Object.assign(oldData, newData);
          db.one(sqlAlter, data)
            .then(result => resolve(result))
            .catch(e => reject(e));
        })
        .catch(e => reject(e));
    }

    const validation = exports.validate(newData, true);
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


/*
 * User.createHash: hashes a password
 *
 * returns a Promise which, when resolved, will produce a hash string
 *
 * cleartext (string): the string to hash
 */

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


/*
 * User.checkPassword: checks an inputted password against a User's stored hash
 *
 * returns a Promise which, when resolved, will produce `true` if the passwords
 * match or `false` if they don't
 *
 * id (integer): the id of the User to check against
 * cleartext (string): the password to check
 */

exports.checkPassword = function (id, cleartext) {
  return new Promise((resolve, reject) => {
    getHash(id).then(hash => {
      bcrypt.compare(cleartext, hash, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  });
};


/*
 * User.delete: removes a User from the db
 *
 * returns a Promise which, when resolved, will produce no data
 *
 * id (integer): the id of the User to delete
 */

exports.delete = function (id) {
  return db.none(sqlDelete, id);
};


/*
 * User.authenticate: gets a user by username and checks their password
 *
 * returns a Promise which, when resolved, will produce the authenticated User.
 * rejects if any step along the way fails
 *
 * username (string): the username to find the User by
 * password (string): plaintext password to check
 */

exports.authenticate = function (username, password) {
  let storedUser;

  // todo: spoof password hash check time if user not found
  return exports.getByUsername(username)
    .then(user => {
      if (!user) {
        throw new Error('Can\'t find this username');
      }
      storedUser = user;
      return exports.checkPassword(user.id, password);
    })
    .then(result => {
      return new Promise((resolve, reject) => {
        if (result) {
          resolve(storedUser);
        }
        reject('Password didn\'t match');
      });
    });
};
