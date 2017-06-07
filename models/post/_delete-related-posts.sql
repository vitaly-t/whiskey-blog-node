/*
 * Deletes a post's related posts
 */

DELETE FROM posts_related_posts WHERE origin = $1;
