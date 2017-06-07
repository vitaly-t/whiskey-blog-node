/*
 * Deletes a reviews's related posts
 */

DELETE FROM reviews_related_posts WHERE origin = $1;
