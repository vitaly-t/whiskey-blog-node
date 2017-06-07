/*
 * Adds a new user
 */

INSERT INTO users(
  name,
  username,
  password_hash,
  access_level
) VALUES (
  $(name),
  $(username),
  $(password_hash),
  $(access_level)
) RETURNING
  id,
  name,
  username,
  access_level;
