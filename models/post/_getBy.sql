/*
 * Gets a deeply-nested post by value of an arbitrary column
 */

SELECT json_build_object(
  'id', posts.id,
  'title', posts.title,
  'subtitle', posts.subtitle,
  'slug', posts.slug,
  'created_at', posts.created_at,
  'published_at', posts.published_at,
  'summary', posts.summary,
  'body', posts.body,
  'author', (SELECT json_build_object(
      'id', users.id,
      'name', users.name,
      'username', users.username,
      'access_level', users.access_level
    ) FROM users WHERE users.id = posts.author),
  'related_reviews', (SELECT json_agg(json_build_object(
      'id', rel_r.id,
      'title', rel_r.title,
      'subtitle', rel_r.subtitle,
      'slug', rel_r.slug,
      'summary', rel_r.summary
    )) FROM reviews rel_r INNER JOIN posts_related_reviews
      ON posts_related_reviews.origin = posts.id
      AND posts_related_reviews.related = rel_r.id),
  'related_posts', (SELECT json_agg(json_build_object(
      'id', rel_p.id,
      'title', rel_p.title,
      'subtitle', rel_p.subtitle,
      'slug', rel_p.slug,
      'summary', rel_p.summary
    )) FROM posts rel_p INNER JOIN posts_related_posts
      ON posts_related_posts.origin = posts.id
      AND posts_related_posts.related = rel_p.id)
)
FROM posts WHERE $1~ = $2;
