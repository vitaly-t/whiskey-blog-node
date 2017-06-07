const express = require('express'),
      router = express.Router(),
      session = require('express-session'),
      env = process.env.NODE_ENV || 'development',
      config = require('../config.json')[env];


// todo: store session data in a production-ready way

router.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false
}));

module.exports = router;
