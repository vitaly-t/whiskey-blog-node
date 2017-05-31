/*
 * constructs a WHERE query of variable length, to be passed into pg-promise
 *
 * params: a params object for a new or existing SELECT statement
 * filterProp: the property of `params` containing an array of filters
 */

exports.where = function (params, filterProp) {
  let result = ' WHERE ',
      clauses = [];

  for (let i = 0; i < params[filterProp].length; i++) {
    let filter = params[filterProp][i],
        operator = '=',
        clause;

    params['filterProp' + i] = filter.field;
    params['filterVal' + i] = filter.value;

    if (filter.hasOwnProperty('comparison')) {
      if (filter.comparison === 'lt') {
        operator = '<';
      } else if (filter.comparison === 'lte') {
        operator = '<=';
      } else if (filter.comparison === 'gt') {
        operator = '>';
      } else if (filter.comparison === 'gte') {
        operator = '>=';
      }
    }

    clause = `$(filterProp${i}~) ${operator} $(filterVal${i})`;
    clauses.push(clause);
  }

  return result + clauses.join(' AND ');
}
