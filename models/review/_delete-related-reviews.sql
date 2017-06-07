/*
 * Deletes a reviews's related reviews
 */

DELETE FROM reviews_related_reviews WHERE origin = $1;
