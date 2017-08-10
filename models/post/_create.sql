/*
 * Adds a new post
 */

INSERT INTO posts(
  title,
  subtitle,
  slug,
  is_published,
  published_at,
  author,
  summary,
  body,
  main_image,
  side_image,
  home_image,
  list_image
) VALUES (
  $(title),
  $(subtitle),
  $(slug),
  $(is_published),
  $(published_at),
  $(author),
  $(summary),
  $(body),
  $(main_image),
  $(side_image),
  $(home_image),
  $(list_image)
) RETURNING
  id,
  title,
  subtitle,
  slug,
  created_at,
  is_published,
  published_at,
  author,
  summary,
  body,
  main_image,
  side_image,
  home_image,
  list_image;
