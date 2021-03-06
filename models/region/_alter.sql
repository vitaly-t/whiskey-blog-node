/*
 * Alters a region
 */

UPDATE regions SET
  name = $(name),
  filter_name = $(filter_name),
  sort_order = $(sort_order)
WHERE id = $(id)
RETURNING
  id,
  name,
  filter_name,
  sort_order;
