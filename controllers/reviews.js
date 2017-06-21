const express = require('express'),
      router = express.Router(),
      Review = require('../models/review/review'),
      DrinkType = require('../models/drink-type/drink-type'),
      Rarity = require('../models/rarity/rarity'),
      Region = require('../models/region/region');


// list reviews, with options to sort and filter in the query string
router.get('/', function (req, res, next) {
  let facets = { filters: [] },
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
        appliedFilters.sort = 'lowest MSRP';
        break;
      case 'priciest':
        facets.orderBy = 'manufacturer_price';
        facets.order = 'DESC';
        appliedFilters.sort = 'highest MSRP';
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

  // filter by drink type
  DrinkType.get(parseInt(req.query.type, 10) || -1)
    .then(drinkType => {
      if (drinkType) {
        facets.filters.push({
          field: 'drink_type',
          value: drinkType.id
        });
        appliedFilters.drinkType = drinkType.plural;
      }

      // filter by rarity
      return Rarity.get(parseInt(req.query.rarity, 10) || -1);
    })
    .then(rarity => {
      if (rarity) {
        facets.filters.push({
          field: 'rarity',
          value: rarity.id
        });
        appliedFilters.rarity = rarity.filter_name;
      }

      // filter by region
      return Region.get(parseInt(req.query.region, 10) || -1);
    })
    .then(region => {
      if (region) {
        facets.filters.push({
          field: 'region',
          value: region.id
        });
        appliedFilters.region = region.filter_name;
      }

      // finally, do main list query, as well as list all items of supporting types
      return Promise.all([
        Review.list(facets),
        DrinkType.list(),
        Rarity.list(),
        Region.list()
      ]);
    })

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
