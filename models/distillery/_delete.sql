/*
 * Deletes a distillery
 */

DELETE FROM distilleries WHERE distilleries.id = $1;
