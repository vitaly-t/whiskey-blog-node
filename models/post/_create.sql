/*
 * Adds a new post
 */

INSERT INTO posts(
  title,
  subtitle,
  slug,
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
  published_at,
  author,
  summary,
  body,
  main_image,
  side_image,
  home_image,
  list_image;
