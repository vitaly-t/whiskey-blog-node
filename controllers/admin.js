const express = require('express'),
      router = express.Router(),
      auth = require('../middleware/auth'),
      bodyParser = require('body-parser'),
      Review = require('../models/review/review'),
      Post = require('../models/post/post'),
      Distillery = require('../models/distillery/distillery'),
      DrinkType = require('../models/drink-type/drink-type'),
      Rarity = require('../models/rarity/rarity'),
      Region = require('../models/region/region');

router.use(bodyParser.urlencoded({ extended: false }));

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
        posts: results[1],
        user: res.locals.currentUser
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
  return Promise.all([
      Review.list({ orderBy: 'title', order: 'ASC' }),
      Post.list({ orderBy: 'title', order: 'ASC' }),
      Distillery.list(),
      DrinkType.list(),
      Rarity.list(),
      Region.list()
    ])
    .then(results => {
      return res.render('../views/admin/review.twig', {
        reviews: results[0],
        posts: results[1],
        distilleries: results[2],
        drinkTypes: results[3],
        rarities: results[4],
        regions: results[5]
      });
    })
    .catch(next);
});
router.post('/reviews/new', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  let data = Object.assign({}, req.body);

  // cull empties, for the benefit of true validation
  for (let key of Object.keys(data)) {
    if (!data[key]) {
      delete data[key];
    }
  }

  // automatically assign author
  data.author = res.locals.currentUser.id;

  return Review.create(data)
    .then(review => {
      return res.redirect('/admin');
    })
    .catch(err => {
      console.log(err);
      return res.redirect('/admin/reviews/new');
    });
});


// edit existing review
router.get('/reviews/:id', auth.requireSession, auth.getCurrentUser, function (req, res, next) {
  return res.send('editing review ' + req.params.id);
})

module.exports = router;
