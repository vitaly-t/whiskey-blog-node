/*
 * Adds a new related post for a post
 */

INSERT INTO posts_related_posts(
  origin,
  related
) VALUES (
  $1,
  $2
);
