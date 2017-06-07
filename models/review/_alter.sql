/*
 * Alters a review
 */

UPDATE reviews SET
  title = $(title),
  subtitle = $(subtitle),
  slug = $(slug),
  published_at = $(published_at),
  author = $(author),
  summary = $(summary),
  body = $(body),
  distillery = $(distillery),
  region = $(region),
  drink_type = $(drink_type),
  rarity = $(rarity),
  proof_min = $(proof_min),
  proof_max = $(proof_max),
  age_min = $(age_min),
  age_max = $(age_max),
  manufacturer_price = $(manufacturer_price),
  realistic_price = $(realistic_price),
  mashbill_description = $(mashbill_description),
  mashbill_recipe = $(mashbill_recipe),
  rating = $(rating)
WHERE id = $(id)
RETURNING
  id,
  title,
  subtitle,
  slug,
  created_at,
  published_at,
  author,
  summary,
  body,
  distillery,
  region,
  drink_type,
  rarity,
  proof_min,
  proof_max,
  age_min,
  age_max,
  manufacturer_price,
  realistic_price,
  mashbill_description,
  mashbill_recipe,
  rating;
