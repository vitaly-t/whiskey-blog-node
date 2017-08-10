const express = require('express'),
      router = express.Router(),
      auth = require('../middleware/auth'),
      Review = require('../models/review/review'),
      Post = require('../models/post/post');


// admin landing page, showing actions and user's items
router.get('/', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  return Promise.all([
      Review.list({
        limit: 5,
        filters: [{ field: 'author', value: res.locals.currentUser.id }]
      }),
      Post.list({
        limit: 5,
        filters: [{ field: 'author', value: res.locals.currentUser.id }]
      })
    ])
    .then(results => {
      // todo: move to template
      return res.render('../views/admin/index.twig', {
        reviews: results[0],
        posts: results[1]
      });
    })
    .catch(next);
});


// list all reviews
router.get('/reviews', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  return res.send('list of reviews');
});


// new review
router.get('/reviews/new', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  return res.send('new review authoring screen');
});


// edit existing review
router.get('/reviews/:id', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  return res.send('editing review ' + req.params.id);
});


// delete a review
router.get('/reviews/delete/:id', auth.requireSession, function (req, res, next) {
  return Review.delete(parseInt(req.params.id, 10))
    .then(() => {
      return res.redirect('/admin');
    })
    .catch(next);
});


// publish a review
router.get('/reviews/publish/:id', auth.requireSession, function (req, res, next) {
  return Review.alter(parseInt(req.params.id, 10), { is_published: true })
    .then(review => {
      return res.redirect('/admin');
    })
    .catch(next);
});


// unpublish a review
router.get('/reviews/unpublish/:id', auth.requireSession, function (req, res, next) {
  return Review.alter(parseInt(req.params.id, 10), { is_published: false })
    .then(review => {
      return res.redirect('/admin');
    })
    .catch(next);
});


module.exports = router;
