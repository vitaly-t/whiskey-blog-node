/*
 * Alters a post
 */

UPDATE posts SET
  title = $(title),
  subtitle = $(subtitle),
  slug = $(slug),
  published_at = $(published_at),
  author = $(author),
  summary = $(summary),
  body = $(body),
  main_image = $(main_image),
  side_image = $(side_image),
  home_image = $(home_image),
  list_image = $(list_image)
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
  main_image,
  side_image,
  home_image,
  list_image;
