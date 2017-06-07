/*
 * Deletes a review
 */

DELETE FROM reviews WHERE reviews.id = $1;
