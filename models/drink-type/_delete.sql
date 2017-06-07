/*
 * Deletes a drink type
 */

DELETE FROM drink_types WHERE drink_types.id = $1;
