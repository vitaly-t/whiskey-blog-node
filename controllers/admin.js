const express = require('express'),
      router = express.Router(),
      User = require('../models/user/user'),
      auth = require('../middleware/auth');


// admin landing page, showing actions and user's items
router.get('/', auth.requireSession, function (req, res, next) {
  User.get(req.session.userId)
    .then(user => {
      res.send('Welcome ' + user.name);
    });
});

module.exports = router;
