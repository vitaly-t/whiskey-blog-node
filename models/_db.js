const pgPromise = require('pg-promise')(),
    env = process.env.NODE_ENV || 'development',
    config = require('../config.json')[env],
    db = pgPromise(config.db);

module.exports.db = db;
