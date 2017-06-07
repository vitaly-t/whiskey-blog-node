/*
 * Deletes a user
 */

DELETE FROM users WHERE users.id = $1;
