const express = require('express'),
      router = express.Router(),
      auth = require('../middleware/auth'),
      User = require('../models/user/user'),
      Review = require('../models/review/review'),
      Post = require('../models/post/post');


// admin landing page, showing actions and user's items
router.get('/', auth.requireSession, function (req, res, next) {
  let userReviews = [],
      loggedInUser;
  User.get(req.session.userId)
    .then(user => {
      loggedInUser = user;
      return Review.list({
        limit: 5,
        filters: [{ field: 'author', value: user.id }]
      });
    })
    .then(reviews => {
      userReviews = reviews;
      return Post.list({
        limit: 5,
        filters: [{ field: 'author', value: loggedInUser.id }]
      });
    })
    .then(posts => {
      const reviewList = userReviews.map(item => `<li><a href="/reviews/${item.slug}">${item.title}</a></li>`),
            postList = posts.map(item => `<li><a href="/posts/${item.slug}">${item.title}</a></li>`);
      return res.send(`
        <h1>Welcome, ${loggedInUser.name}</h1>
        <h2>Your recent reviews</h2>
        <ul>
          ${reviewList.join('')}
        </ul>
        <h2>Your recent posts</h2>
        <ul>
          ${postList.join('')}
        </ul>
      `);
    })
    .catch(next);
});

module.exports = router;
