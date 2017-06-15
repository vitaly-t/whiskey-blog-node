const express = require('express'),
      bodyParser = require('body-parser'),
      router = express.Router(),
      User = require('../models/user/user'),
      auth = require('../middleware/auth');


// ability to parse request bodies is no longer bundled with express because reasons
router.use(bodyParser.urlencoded({ extended: false }));

// display the login form
router.get('/', auth.requireGuest, function (req, res, next) {
  res.render('../views/login/login.twig', { message: '\'Sup' });
});

// process login data
router.post('/', function (req, res, next) {
  if (req.body.username && req.body.password) {
    User.authenticate(req.body.username, req.body.password)
      .then(user => {
        req.session.userId = user.id;
        return res.redirect('/admin');
      })
      .catch(e => {
        res.send('<p>Your information didn\'t match our records. Please try again</p>');
      });
  } else {
    res.send('<p>We need both a username and password here</p>');
  }
});

module.exports = router;
