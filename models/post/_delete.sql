/*
 * Deletes a post
 */

DELETE FROM posts WHERE posts.id = $1;
