/*
 * Alters a distillery
 */

UPDATE distilleries SET
  name = $(name),
  state = $(state),
  city = $(city)
WHERE id = $(id)
RETURNING
  id,
  name,
  state,
  city;
