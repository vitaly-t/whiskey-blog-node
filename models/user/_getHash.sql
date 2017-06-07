/*
 * Gets a user's password hash
 */

SELECT password_hash FROM users WHERE id = $1;
