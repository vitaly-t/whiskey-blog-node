/*
 * Helper functions for working with post slugs
 */

exports.fromString = function (str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
};
