/*
 * Adds a new related review for a post
 */

INSERT INTO posts_related_reviews(
  origin,
  related
) VALUES (
  $1,
  $2
);
