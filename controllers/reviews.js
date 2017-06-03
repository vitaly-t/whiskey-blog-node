const express = require('express'),
      router = express.Router(),
      Review = require('../models/review');

// return 100 recent reviews
router.get('/', function (req, res, next) {
  Review.list()
    .then(reviews => res.json(reviews))
    .catch(e => next());
});

// get a review by url slug
router.get('/:slug', function (req, res, next) {
  Review.getBySlug(req.params.slug)
    .then(review => res.json(review))
    .catch(e => next());
});

module.exports = router;
