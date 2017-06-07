/*
 * Deletes a rarity
 */

DELETE FROM rarities WHERE rarities.id = $1;
