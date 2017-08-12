const Twig = require('twig'),
      express = require('express'),
      router = express.Router(),
      Post = require('../models/post/post'),
      Review = require('../models/review/review'),
      _displayFunctions = require('../helpers/display.js'),
      twigMarkdown = require('twig-markdown');

// pre-routing middleware
router.use(require('../middleware/session'));

// templating extensions
Twig.extend(twigMarkdown);

// load all controllers
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/articles', require('./posts'));
router.use('/reviews', require('./reviews'));
router.use('/admin', require('./admin'));
router.use('/utility', require('./utility'));

// homepage route
router.get('/', function (req, res, next) {
  Promise.all([
      Review.list({
        limit: 5,
        filters: [
          {
            field: 'is_published',
            value: true
          }
        ]
      }),
      Post.list({
        limit: 5,
        filters: [
          {
            field: 'is_published',
            value: true
          }
        ]
      })
    ])
    .then(results => {
      return res.render('../views/home/index.twig', {
        items: results[0].concat(results[1]).sort((a, b) => b.published_at.getTime() - a.published_at.getTime())
      })
    })
    .catch(next);
});

// 404 handler
router.use(function (req, res, next) {
  next({ status: 404, message: `We couldn't find "${req.path.substr(1)}"` });
});

// general error handler
router.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  let statusCode = err.status || 500,
      message = err.message || 'Something went wrong';

  res.status(statusCode)

  if (statusCode === 401) {
    message = "Can't let you do that, Fox";
  }

  Review.list({
      limit: 1,
      orderBy: 'random'
    })
    .then(reviews => {
      return res.status(404).render('../views/error/error.twig', {
        review: reviews[0],
        statusCode: statusCode,
        message: message
      });
    })
    .catch(next);
});

module.exports = router;
