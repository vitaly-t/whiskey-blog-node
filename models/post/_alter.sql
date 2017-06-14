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
  body = $(body)
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
  body;
