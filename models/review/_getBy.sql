/*
 * Gets a deeply-nested review by value of an arbitrary column
 */

SELECT json_build_object(
  'id', reviews.id,
  'title', reviews.title,
  'subtitle', reviews.subtitle,
  'slug', reviews.slug,
  'created_at', reviews.created_at,
  'published_at', reviews.published_at,
  'summary', reviews.summary,
  'body', reviews.body,
  'proof_min', reviews.proof_min,
  'proof_max', reviews.proof_max,
  'age_min', reviews.age_min,
  'age_max', reviews.age_max,
  'manufacturer_price', reviews.manufacturer_price,
  'realistic_price', reviews.realistic_price,
  'mashbill_description', reviews.mashbill_description,
  'mashbill_recipe', reviews.mashbill_recipe,
  'rating', reviews.rating,
  'author', (SELECT json_build_object(
      'id', users.id,
      'name', users.name,
      'username', users.username,
      'access_level', users.access_level
    ) FROM users WHERE users.id = reviews.author),
  'distillery', (SELECT json_build_object(
      'id', distilleries.id,
      'name', distilleries.name
    ) FROM distilleries WHERE distilleries.id = reviews.distillery),
  'region', (SELECT json_build_object(
      'id', regions.id,
      'name', regions.name,
      'filter_name', regions.filter_name
    ) FROM regions WHERE regions.id = reviews.region),
  'drink_type', (SELECT json_build_object(
      'id', drink_types.id,
      'singular', drink_types.singular,
      'plural', drink_types.plural
    ) FROM drink_types WHERE drink_types.id = reviews.drink_type),
  'rarity', (SELECT json_build_object(
      'id', rarities.id,
      'name', rarities.name,
      'filter_name', rarities.filter_name
    ) FROM rarities WHERE rarities.id = reviews.rarity),
  'related_reviews', (SELECT json_agg(json_build_object(
      'id', rel_r.id,
      'title', rel_r.title,
      'subtitle', rel_r.subtitle,
      'slug', rel_r.slug,
      'summary', rel_r.summary
    )) FROM reviews rel_r INNER JOIN reviews_related_reviews
      ON reviews_related_reviews.origin = reviews.id
      AND reviews_related_reviews.related = rel_r.id),
  'related_posts', (SELECT json_agg(json_build_object(
      'id', rel_p.id,
      'title', rel_p.title,
      'subtitle', rel_p.subtitle,
      'slug', rel_p.slug,
      'summary', rel_p.summary
    )) FROM posts rel_p INNER JOIN reviews_related_posts
      ON reviews_related_posts.origin = reviews.id
      AND reviews_related_posts.related = rel_p.id)
)
FROM reviews WHERE $1~ = $2;
