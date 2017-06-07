/*
 * Adds a new drink type
 */

INSERT INTO drink_types(
  singular,
  plural
) VALUES (
  $(singular),
  $(plural)
) RETURNING
  id,
  singular,
  plural;
