const express = require('express'),
      router = express.Router(),
      Review = require('../models/review/review');

// return 100 recent reviews
router.get('/', function (req, res, next) {
  Review.list()
    .then(reviews => res.json(reviews))
    .catch(e => next());
});

// get a review by url slug
router.get('/:slug', function (req, res, next) {
  Review.getBySlug(req.params.slug)
    .then(review => {
      return res.render('../views/reviews/detail.twig', {
        review: review
      });
    })
    .catch(next);
});

module.exports = router;
