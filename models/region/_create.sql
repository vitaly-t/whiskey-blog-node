/*
 * Adds a new region
 */

INSERT INTO regions(
  name,
  filter_name,
  sort_order
) VALUES (
  $(name),
  $(filter_name),
  $(sort_order)
) RETURNING
  id,
  name,
  filter_name,
  sort_order;
