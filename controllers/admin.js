const express = require('express'),
      router = express.Router(),
      auth = require('../middleware/auth'),
      User = require('../models/user/user'),
      Review = require('../models/review/review'),
      Post = require('../models/post/post');


// admin landing page, showing actions and user's items
router.get('/', auth.requireSession, function (req, res, next) {
  let loggedInUser;
  User.get(req.session.userId)
    .then(user => {
      loggedInUser = user;
      return Promise.all([
          Review.list({
            limit: 5,
            filters: [{ field: 'author', value: user.id }]
          }),
          Post.list({
            limit: 5,
            filters: [{ field: 'author', value: user.id }]
          })
        ]);
    })
    .then(results => {
      // todo: move to template
      return res.render('../views/admin/index.twig', {
        reviews: results[0],
        posts: results[1],
        user: loggedInUser
      });
    })
    .catch(next);
});

module.exports = router;
