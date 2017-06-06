/*
 * Adds a set of test data
 * Should be of some use when building routes and views
 */

const Distillery = require('./distillery/distillery'),
      DrinkType = require('./drink-type/drink-type'),
      Post = require('./post/post'),
      Rarity = require('./rarity/rarity'),
      Region = require('./region/region'),
      Review = require('./review/review'),
      User = require('./user/user');

let content = {
  distilleries: [],
  drinkTypes: [],
  rarities: [],
  regions: [],
  users: []
};

// independent types (no foreign keys)

// distilleries
Distillery.create({ name: 'Buffalo Trace', city: 'Frankfort', state: 'Kentucky' })
  .then(distillery => {
    content.distilleries.push(distillery);
    return Distillery.create({ name: 'Heaven Hill', city: 'Bardstown', state: 'Kentucky' });
  })
  .then(distillery => {
    content.distilleries.push(distillery);

// drink types
    return DrinkType.create({ singular: 'Bourbon', plural: 'bourbons' });
  })
  .then(drinkType => {
    content.drinkTypes.push(drinkType);
    return DrinkType.create({ singular: 'Rye', plural: 'ryes' });
  })
  .then(drinkType => {
    content.drinkTypes.push(drinkType);

// rarities
    return Rarity.create({ name: 'Common', filter_name: 'ubiquitous', sort_order: 10 });
  })
  .then(rarity => {
    content.rarities.push(rarity);
    return Rarity.create({ name: 'Uncommon', filter_name: 'uncommon', sort_order: 20 });
  })
  .then(rarity => {
    content.rarities.push(rarity);

// regions
    return Region.create({ name: 'United States: Kentucky', filter_name: 'Kentucky', sort_order: 60 });
  })
  .then(region => {
    content.regions.push(region);

// users
    return User.create({ name: 'Tim Gavlick', username: 'timgavlick', password: 'abcdefg', access_level: 0 });
  })
  .then(user => {
    content.users.push(user);

// dependent types

// posts
    return Post.create({
      title: 'How to Read Labels',
      author: content.users[0].id,
      summary: "It may sound boring, but learning to read labels with an eye for detail will pay dividends",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

             Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

             ## Ullam incidunt libero veniam necessitatibus

             - Quae modi quasi facilis nobis
             - Voluptatem officia autem quidem

             Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`
    });
  })
  .then(post => {
    return Post.create({
      title: 'An American Whiskey Starter Kit',
      author: content.users[0].id,
      summary: "A diverse sampling of American whiskeys to get you started",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

             Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

             ## Ullam incidunt libero veniam necessitatibus

             - Quae modi quasi facilis nobis
             - Voluptatem officia autem quidem

             Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`
    });
  })
  .then(post => {

// reviews
    return Review.create({
      title: 'Elijah Craig',
      subtitle: 'Small Batch Bourbon',
      author: content.users[0].id,
      summary: "Ol' somewhat-less-reliable",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

             Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

             ## Ullam incidunt libero veniam necessitatibus

             - Quae modi quasi facilis nobis
             - Voluptatem officia autem quidem

             Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      distillery: content.distilleries[1].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[0].id,
      rarity: content.rarities[0].id,
      proof_min: 94,
      proof_max: 94,
      manufacturer_price: 30,
      mashbill_description: 'Bourbon',
      mashbill_recipe: '75% corn, 13% rye, 12% barley',
      rating: 72,
      related_posts: [post.id]
    });
  })
  .then(review => {
    return Review.create({
      title: 'Rittenhouse Rye',
      subtitle: 'Bottled-in-Bond',
      author: content.users[0].id,
      summary: "A benchmark rye",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

             Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

             ## Ullam incidunt libero veniam necessitatibus

             - Quae modi quasi facilis nobis
             - Voluptatem officia autem quidem

             Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      distillery: content.distilleries[1].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[1].id,
      rarity: content.rarities[0].id,
      proof_min: 100,
      manufacturer_price: 30,
      mashbill_description: 'Barely-legal rye',
      mashbill_recipe: '51% rye, 37% corn, 12% barley',
      rating: 68,
      related_reviews: [review.id]
    });
  })
  .then(review => {
    return Review.create({
      title: 'Stagg Jr.',
      author: content.users[0].id,
      summary: "A short bottle with a tall order",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

             Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

             ## Ullam incidunt libero veniam necessitatibus

             - Quae modi quasi facilis nobis
             - Voluptatem officia autem quidem

             Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      distillery: content.distilleries[0].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[0].id,
      rarity: content.rarities[1].id,
      proof_min: 128.7,
      proof_max: 138,
      manufacturer_price: 55,
      realistic_price: "$60+",
      mashbill_description: 'BT mashbill #1',
      mashbill_recipe: 'approx. 75% corn, 15% barley, 10% rye',
      rating: 80
    });
  })
  .then(review => {
    console.log('done');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
