const express = require('express'),
      router = express.Router(),
      Post = require('../models/post/post');

// return 100 recent posts
router.get('/', function (req, res, next) {
  Post.list()
    .then(posts => res.json(posts))
    .catch(e => next());
});

// get a post by url slug
router.get('/:slug', function (req, res, next) {
  Post.getBySlug(req.params.slug)
    .then(post => res.json(post))
    .catch(e => next());
});

module.exports = router;
