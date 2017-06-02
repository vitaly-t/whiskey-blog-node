const express = require('express'),
      router = express.Router(),
      Post = require('../models/post');

router.get('/', function (req, res, next) {
  Post.list()
    .then(posts => res.json(posts))
    .catch(e => next());
});

router.get('/:id(\\d+)', function (req, res, next) {
  Post.get(parseInt(req.params.id, 10))
    .then(post => res.json(post))
    .catch(e => next());
});

module.exports = router;
