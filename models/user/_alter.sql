/*
 * Alters a user
 */

UPDATE users SET
  name = $(name),
  username = $(username),
  password_hash = $(password_hash),
  access_level = $(access_level)
WHERE id = $(id)
RETURNING
  id,
  name,
  username,
  access_level;
