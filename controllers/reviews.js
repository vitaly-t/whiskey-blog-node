const express = require('express'),
      router = express.Router(),
      Review = require('../models/review');

router.get('/', function (req, res, next) {
  Review.list()
    .then(reviews => res.json(reviews))
    .catch(e => next());
});

router.get('/:id(\\d+)', function (req, res, next) {
  Review.get(parseInt(req.params.id, 10))
    .then(review => res.json(review))
    .catch(e => next());
});

module.exports = router;
