/*
 * Deletes a region
 */

DELETE FROM regions WHERE regions.id = $1;
