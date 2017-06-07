/*
 * Gets a user by id
 */

SELECT id, name, username, access_level FROM users WHERE id = $1;
