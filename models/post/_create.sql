/*
 * Adds a new post
 */

INSERT INTO posts(
  title,
  slug,
  published_at,
  author,
  summary,
  body
) VALUES (
  $(title),
  $(slug),
  $(published_at),
  $(author),
  $(summary),
  $(body)
) RETURNING
  id,
  title,
  slug,
  created_at,
  published_at,
  author,
  summary,
  body;
