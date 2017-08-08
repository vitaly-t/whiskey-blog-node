const Twig = require('twig'),
      express = require('express'),
      router = express.Router(),
      User = require('../models/user/user'),
      auth = require('../middleware/auth');


// log the current user out and redirect them to the homepage
router.get('/', function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      return next(err);
    } else {
      return res.redirect('/')
    }
  });
});


module.exports = router;
