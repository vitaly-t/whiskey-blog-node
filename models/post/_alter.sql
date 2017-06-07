/*
 * Alters a post
 */

UPDATE posts SET
  title = $(title),
  slug = $(slug),
  published_at = $(published_at),
  author = $(author),
  summary = $(summary),
  body = $(body)
WHERE id = $(id)
RETURNING
  id,
  title,
  slug,
  created_at,
  published_at,
  author,
  summary,
  body;
