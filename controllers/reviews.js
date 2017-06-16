const express = require('express'),
      router = express.Router(),
      Review = require('../models/review/review'),
      DrinkType = require('../models/drink-type/drink-type'),
      Rarity = require('../models/rarity/rarity'),
      Region = require('../models/region/region');

// return 100 recent reviews
router.get('/', function (req, res, next) {
  let facets = {},
      appliedFilters = {};

  // make query params available in template functions
  res.locals.query = req.query;

  // sorting
  if (req.query.sort) {
    switch (res.locals.query.sort) {
      case 'best':
        facets.orderBy = 'rating';
        facets.order = 'DESC';
        appliedFilters.sort = 'what I liked the most';
        break;
      case 'worst':
        facets.orderBy = 'rating';
        facets.order = 'ASC';
        appliedFilters.sort = 'what I liked the least';
        break;
      case 'cheapest':
        facets.orderBy = 'manufacturer_price';
        facets.order = 'ASC';
        appliedFilters.sort = 'lowest price';
        break;
      case 'priciest':
        facets.orderBy = 'manufacturer_price';
        facets.order = 'DESC';
        appliedFilters.sort = 'highest price';
        break;
      case 'hottest':
        facets.orderBy = 'proof_min';
        facets.order = 'DESC';
        appliedFilters.sort = 'highest proof';
        break;
      case 'oldest':
        facets.orderBy = 'age_min';
        facets.order = 'DESC';
        appliedFilters.sort = 'highest age';
        break;
    }
  }

  Promise.all([
      Review.list(facets),
      DrinkType.list(),
      Rarity.list(),
      Region.list()
    ])
    .then(data => {
      return res.render('../views/reviews/list.twig', {
        reviews: data[0],
        drinkTypes: data[1],
        rarities: data[2],
        regions: data[3],
        path: req.baseUrl,
        appliedFilters: appliedFilters
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
