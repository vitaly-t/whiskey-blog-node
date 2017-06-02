const express = require('express'),
      router = express.Router(),
      Post = require('../models/post'),
      Review = require('../models/review');

// load all controllers
router.use('/posts', require('./posts'));
router.use('/reviews', require('./reviews'));

// homepage route
router.get('/', function (req, res) {
  let items;
  Review.list({ limit: 5 })
    .then(reviews => {
      items = reviews;
      return Post.list({ limit: 5 });
    })
    .then(posts => {
      res.json(items.concat(posts).sort((a, b) => b.published_at.getTime() - a.published_at.getTime()));
    })
});

// 404 handler
router.use(function (req, res, next) {
  res.status(404);
  res.send({ error: `Not found: ${req.url}` });
});

module.exports = router;
