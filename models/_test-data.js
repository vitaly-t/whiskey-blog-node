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
    return Rarity.create({ name: 'Not happening', filter_name: 'unobtanium', sort_order: 40 });
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
      is_published: true,
      author: content.users[0].id,
      summary: "It may sound boring, but learning to read labels with an eye for detail will pay dividends",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

## Ullam incidunt libero veniam necessitatibus

- Quae modi quasi facilis nobis
- Voluptatem officia autem quidem

Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      main_image: '/uploads/placeholder/placeholder-review-main.jpg',
      side_image: '/uploads/placeholder/placeholder-review-side.jpg',
      home_image: '/uploads/placeholder/placeholder-review-home.jpg',
      list_image: '/uploads/placeholder/placeholder-review-list.jpg'
    });
  })
  .then(post => {
    return Post.create({
      title: 'An American Whiskey Starter Kit',
      is_published: true,
      author: content.users[0].id,
      summary: "A diverse sampling of American whiskeys to get you started",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

## Ullam incidunt libero veniam necessitatibus

- Quae modi quasi facilis nobis
- Voluptatem officia autem quidem

Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      main_image: '/uploads/placeholder/placeholder-review-main.jpg',
      side_image: '/uploads/placeholder/placeholder-review-side.jpg',
      home_image: '/uploads/placeholder/placeholder-review-home.jpg',
      list_image: '/uploads/placeholder/placeholder-review-list.jpg'
    });
  })
  .then(post => {

// reviews
    return Review.create({
      title: 'Elijah Craig',
      subtitle: 'Small Batch Bourbon',
      is_published: true,
      author: content.users[0].id,
      summary: "Ol' somewhat-less-reliable",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

## Ullam incidunt libero veniam necessitatibus

- Quae modi quasi facilis nobis
- Voluptatem officia autem quidem

Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      main_image: '/uploads/placeholder/placeholder-review-main.jpg',
      side_image: '/uploads/placeholder/placeholder-review-side.jpg',
      home_image: '/uploads/placeholder/placeholder-review-home.jpg',
      list_image: '/uploads/placeholder/placeholder-review-list.jpg',
      distillery: content.distilleries[1].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[0].id,
      rarity: content.rarities[0].id,
      proof_min: 94,
      proof_max: 94,
      age_min: 0,
      age_max: 0,
      manufacturer_price: 30,
      mashbill_description: 'Bourbon',
      mashbill_recipe: '75% corn, 13% rye, 12% barley',
      rating: 72,
      related_posts: [post.id]
    });
  })
  .then(review => {
    return Review.create({
      title: 'Rittenhouse',
      subtitle: '25-year Rye',
      is_published: true,
      author: content.users[0].id,
      summary: "A benchmark rye",
      body: `
Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

- Quae modi quasi facilis nobis
- Voluptatem officia autem quidem

Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!

## Nose
### (Vanilla, caramel, lorem, ipsum, sit)

Soluta provident natus illum, veritatis ullam perspiciatis, eum illo itaque consectetur hic mollitia et blanditiis obcaecati quo sint voluptatibus! Eos dolore deserunt beatae natus necessitatibus asperiores adipisci aliquam esse atque odit incidunt nobis blanditiis omnis voluptate, officiis nam animi doloribus voluptatibus veniam ullam maiores nulla ratione quae, ea dolores. Corporis, molestiae. Minus, ut?

## Taste
### (lorem, ipsum, sit)

Labore officia et debitis unde provident perferendis quo consectetur, iste sint, sed nam quia eius nisi exercitationem magni vitae. Ea ipsa voluptas accusamus ducimus commodi officia sunt qui ad quibusdam vero, quae, nemo quaerat? Reiciendis maxime tenetur velit in porro eveniet vel fugit, voluptates maiores quis repudiandae rem provident tempore magni earum consectetur eius quos ea placeat.

## Finish
### (lorem, ipsum, sit)

Tempore culpa minima, cumque sunt repudiandae libero cum hic, quidem veniam consectetur et quaerat sint, accusamus odit eveniet aperiam neque suscipit veritatis saepe. Debitis rem similique, aut maiores aspernatur libero voluptatem cupiditate ipsam id ratione delectus quisquam, cumque dolore consequuntur itaque voluptatibus tempora.

## Thoughts

![Image caption, lorem ipsum](/uploads/placeholder/placeholder-review-content-1.jpg)

Minus commodi, ipsa dolores explicabo natus distinctio optio, facilis, id iusto temporibus architecto earum dolorum omnis quae. Sed consequatur ut sunt animi dolores voluptates, dolorem inventore quasi, quas laborum similique hic voluptatem quam molestiae debitis eum architecto vero officia ad accusantium iste impedit. Aut earum minima.

Quae laborum eaque excepturi impedit cupiditate harum, similique quasi ea suscipit eveniet nostrum consectetur nesciunt! Eveniet nostrum tempore quidem cum repellat, non eaque voluptas vitae aspernatur nulla voluptatum voluptate cumque aliquid soluta sed adipisci harum, doloribus ex ipsum laboriosam consectetur inventore. Commodi non, eveniet fugit labore vitae, ad, accusantium assumenda eum reprehenderit, vel nisi maxime iste perspiciatis repellendus? Incidunt porro, hic quis magni? Quae quaerat dolores voluptate ipsa cumque, facere, ea doloribus corrupti impedit labore praesentium earum doloremque itaque eum odit animi reiciendis quas neque.

## Buy it?

Dolore nihil libero voluptas, repellat pariatur sed quidem et animi, ipsa expedita necessitatibus numquam quisquam repudiandae obcaecati vitae temporibus quam. Doloremque, recusandae, nihil! Blanditiis accusamus voluptatum veritatis, magnam fugit. Asperiores pariatur reprehenderit quidem! Amet error eaque sapiente? In reiciendis iste, accusamus.

             `,
      main_image: '/uploads/placeholder/placeholder-review-main.jpg',
      side_image: '/uploads/placeholder/placeholder-review-side.jpg',
      home_image: '/uploads/placeholder/placeholder-review-home.jpg',
      list_image: '/uploads/placeholder/placeholder-review-list.jpg',
      distillery: content.distilleries[1].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[1].id,
      rarity: content.rarities[2].id,
      proof_min: 100,
      proof_max: 100,
      age_min: 25,
      age_max: 25,
      manufacturer_price: 200,
      realistic_price: 'Thousands',
      mashbill_description: 'Barely-legal rye',
      mashbill_recipe: '51% rye, 37% corn, 12% barley',
      rating: 98,
      related_reviews: [review.id]
    });
  })
  .then(review => {
    return Review.create({
      title: 'Stagg Jr.',
      is_published: true,
      author: content.users[0].id,
      summary: "A short bottle with a tall order",
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.

Deserunt adipisci labore voluptates repudiandae, error quod. Iure, illum ullam veritatis perspiciatis cumque natus soluta odit velit laboriosam molestias non sunt asperiores voluptatibus dolores qui temporibus recusandae quisquam aperiam quaerat mollitia amet cum sit sed.

## Ullam incidunt libero veniam necessitatibus

- Quae modi quasi facilis nobis
- Voluptatem officia autem quidem

Explicabo voluptate reiciendis sit necessitatibus sapiente eaque incidunt, possimus odit itaque praesentium aut perferendis veritatis minus dolores commodi. Distinctio earum vel reprehenderit at rem, corporis qui suscipit aliquid perferendis assumenda placeat, dicta vitae cupiditate, quisquam officia ut ducimus, aperiam dolores nemo. Nulla, hic!`,
      main_image: '/uploads/placeholder/placeholder-review-main.jpg',
      side_image: '/uploads/placeholder/placeholder-review-side.jpg',
      home_image: '/uploads/placeholder/placeholder-review-home.jpg',
      list_image: '/uploads/placeholder/placeholder-review-list.jpg',
      distillery: content.distilleries[0].id,
      region: content.regions[0].id,
      drink_type: content.drinkTypes[0].id,
      rarity: content.rarities[1].id,
      proof_min: 128.7,
      proof_max: 138,
      age_min: 0.5,
      age_max: 12,
      manufacturer_price: 55,
      realistic_price: "$60+",
      mashbill_description: 'BT mashbill #1',
      mashbill_recipe: 'approx. 75% corn, 15% barley, 10% rye',
      rating: 80
    });
  })
  .then(review => {
    console.log('Test data added');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
