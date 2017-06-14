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
  body
) VALUES (
  $(title),
  $(subtitle),
  $(slug),
  $(published_at),
  $(author),
  $(summary),
  $(body)
) RETURNING
  id,
  title,
  subtitle,
  slug,
  created_at,
  published_at,
  author,
  summary,
  body;
