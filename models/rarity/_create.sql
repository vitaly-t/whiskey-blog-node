/*
 * Adds a new rarity
 */

INSERT INTO rarities(
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
