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

  // filter by proof
  if (req.query.minproof || req.query.maxProof) {
    const minProof = parseFloat(req.query.minproof, 10) || 80;
          maxProof = parseFloat(req.query.maxproof, 10) || 200;
    if (!isNaN(minProof) && minProof > 80 && minProof <= maxProof) {
      facets.filters.push({
        field: 'proof_max',
        comparison: 'gte',
        value: minProof
      });
    }
    if (!isNaN(maxProof) && maxProof < 200 && maxProof >= minProof) {
      facets.filters.push({
        field: 'proof_min',
        comparison: 'lte',
        value: maxProof
      });
    }
  }

  // filter by age
  if (req.query.minage || req.query.maxage) {
    const minAge = parseFloat(req.query.minage, 10) || 0;
          maxAge = parseFloat(req.query.maxage, 10) || 20;
    if (!isNaN(minAge) && minAge > 0 && minAge <= maxAge) {
      facets.filters.push({
        field: 'age_max',
        comparison: 'gte',
        value: minAge
      });
    }
    if (!isNaN(maxAge) && maxAge < 20 && maxAge >= minAge) {
      facets.filters.push({
        field: 'age_min',
        comparison: 'lte',
        value: maxAge
      });
    }
  }

  // filter by manufacturer price
  if (req.query.minprice || req.query.maxprice) {
    const minPrice = parseFloat(req.query.minprice, 10) || 0;
          maxPrice = parseFloat(req.query.maxprice, 10) || 200;
    if (!isNaN(minPrice) && minPrice > 0 && minPrice <= maxPrice) {
      facets.filters.push({
        field: 'manufacturer_price',
        comparison: 'gte',
        value: minPrice
      });
    }
    if (!isNaN(maxPrice) && maxPrice < 200 && maxPrice >= minPrice) {
      facets.filters.push({
        field: 'manufacturer_price',
        comparison: 'lte',
        value: maxPrice
      });
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
