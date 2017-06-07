/*
 * Adds a new related post for a review
 */

INSERT INTO reviews_related_posts(
  origin,
  related
) VALUES (
  $1,
  $2
);
