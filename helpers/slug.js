/*
 * Helper functions for working with post slugs
 */


/*
 * fromString: creates a decent slug from a string (say, a post title)
 *
 * returns a formatted url slug
 *
 * str (string): a string to make url-y
 */

exports.fromString = function (str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
};
