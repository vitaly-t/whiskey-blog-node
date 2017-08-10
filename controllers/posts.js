const express = require('express'),
      router = express.Router(),
      auth = require('../middleware/auth'),
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
router.get('/:slug', auth.getCurrentUser, function (req, res, next) {
  Post.getBySlug(req.params.slug)
    .then(post => {
      if (post.is_published || res.locals.currentUser) {
        return res.render('../views/posts/detail.twig', {
          post: post
        });
      } else {
        next({
          status: 404,
          message: 'Not found'
        });
      }
    })
    .catch(e => next());
});

module.exports = router;
