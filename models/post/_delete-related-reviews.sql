/*
 * Deletes a post's related reviews
 */

DELETE FROM posts_related_reviews WHERE origin = $1;
