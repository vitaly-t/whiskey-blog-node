const express = require('express'),
      router = express.Router(),
      Review = require('../models/review/review'),
      DrinkType = require('../models/drink-type/drink-type'),
      Rarity = require('../models/rarity/rarity'),
      Region = require('../models/region/region');

// return 100 recent reviews
router.get('/', function (req, res, next) {
  console.log(req.query);
  Promise.all([
      Review.list(),
      DrinkType.list(),
      Rarity.list(),
      Region.list()
    ])
    .then(data => {
      return res.render('../views/reviews/list.twig', {
        reviews: data[0],
        drinkTypes: data[1],
        rarities: data[2],
        regions: data[3]
      });
    })
    .catch(next);
});

// get a review by url slug
router.get('/:slug', function (req, res, next) {
  Review.getBySlug(req.params.slug)
    .then(review => {
      return res.render('../views/reviews/detail.twig', {
        review: review
      });
    })
    .catch(next);
});

module.exports = router;
