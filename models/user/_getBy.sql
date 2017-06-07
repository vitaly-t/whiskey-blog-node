/*
 * Gets a single user by an arbitrary column
 */

SELECT id, name, username, access_level FROM users WHERE $1~ = $2;
