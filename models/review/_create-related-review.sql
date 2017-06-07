/*
 * Adds a new related review for a review
 */

INSERT INTO reviews_related_reviews(
  origin,
  related
) VALUES (
  $1,
  $2
);
