/*
 * Adds a new distillery
 */

INSERT INTO distilleries(
  name,
  state,
  city
) VALUES (
  $(name),
  $(state),
  $(city)
) RETURNING
  id,
  name,
  state,
  city;
