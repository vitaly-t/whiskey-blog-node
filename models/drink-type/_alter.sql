/*
 * Alters a drink type
 */

UPDATE drink_types SET
  singular = $(singular),
  plural = $(plural)
WHERE id = $(id)
RETURNING
  id,
  singular,
  plural;
