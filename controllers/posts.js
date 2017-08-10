const express = require('express'),
      router = express.Router(),
      Post = require('../models/post/post');

// show recent posts
router.get('/', function (req, res, next) {
  Post.list({
      // only get published items
      filters: [
        {
          field: 'is_published',
          value: true
        }
      ]
    })
    .then(posts => {
      return res.render('../views/posts/list.twig', {
        posts: posts
      });
    })
    .catch(e => next());
});

// get a post by url slug
router.get('/:slug', function (req, res, next) {
  Post.getBySlug(req.params.slug)
    .then(post => {
      return res.render('../views/posts/detail.twig', {
        post: post
      });
    })
    .catch(e => next());
});

module.exports = router;
