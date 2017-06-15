const Twig = require('twig'),
      express = require('express'),
      router = express.Router(),
      Post = require('../models/post/post'),
      Review = require('../models/review/review');

// pre-routing middleware
router.use(require('../middleware/session'));

// load all controllers
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/posts', require('./posts'));
router.use('/reviews', require('./reviews'));
router.use('/admin', require('./admin'));

// homepage route
router.get('/', function (req, res, next) {
  Promise.all([ Review.list({ limit: 5 }), Post.list({ limit: 5 }) ])
    .then(results => {
      return res.render('../views/home/index.twig', {
        items: results[0].concat(results[1]).sort((a, b) => b.published_at.getTime() - a.published_at.getTime())
      })
    })
    .catch(next);
});

// 404 handler
router.use(function (req, res, next) {
  res.status(404).send('404');
});

// general error handler
router.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || 500,
        message = err.message || 'Something went wrong';

  if (statusCode === 401) {
    res.status(statusCode).send(`<h1>Can't let you do that, StarFox</h1><p><a href="/login">Sign in</a></p>`);
  } else {
    res.status(statusCode).send(`<h1>${statusCode}</h1><p>${message}</p>`);
  }
});

module.exports = router;
