'use strict';

/*
 * validate: validates a set of data against a schema
 *
 * returns an object:
 *   result: `true` if validation passed, `false` if not
 *   message: reason for producing said result
 *
 * data (object): fields and their values to check
 * schema (object): schema object defining fields and their constraints
 * suppressRequired (boolean): bypass `required` fields in schema definition.
 *   Useful to testing individual fields
 */

exports.validate = function (data, schema, suppressRequired=false) {
  let result = { result: false, message: '' };

  // do a cursory check for required fields
  if (!suppressRequired) {
    for (const key of Object.keys(schema)) {
      const field = schema[key];
      if (field.required === true && !data.hasOwnProperty(key)) {
        result.message = `Missing required field: '${key}'`;
        return result;
      }
    }
  }

  // validate items in schema
  for (const key of Object.keys(data)) {
    let field = data[key];

    if (!schema.hasOwnProperty(key)) {
      continue;
    }

    // types
    if (!validateTypes(field, schema[key].types)) {
      result.message = `Expected field '${key}' to be a ${schema[key].types.join(' or ')}`;
      return result;
    }

    // element types
    if (schema[key].hasOwnProperty('elementTypes')) {
      for (const element of field) {
        if (!validateTypes(element, schema[key].elementTypes)) {
          result.message = `Iterable '${key}'s elements should be ${schema[key].types.join(' or ')}s`;
          return result;
        }
      }
    }

    // string or collection length constraints
    if (schema[key].hasOwnProperty('minLength')) {
      if (field.length < schema[key].minLength) {
        result.message = `Field '${key}' should have a minimum length of ${schema[key].minLength}`;
        return result;
      }
    }
    if (schema[key].hasOwnProperty('maxLength')) {
      if (field.length > schema[key].maxLength) {
        result.message = `Field '${key}' should have a maximum length of ${schema[key].maxLength}`;
        return result;
      }
    }

    // string regex
    if (schema[key].hasOwnProperty('regex')) {
      if (!schema[key].regex.test(field)) {
        result.message = `Field '${key}' should conform to ${schema[key].regex.toString()}`;
        return result;
      }
    }

    // number min, max, and step constraints
    if (typeof field === 'number' && schema[key].hasOwnProperty('min')) {
      if (field < schema[key].min) {
        result.message = `Field '${key}' should be at least ${schema[key].min}`;
        return result;
      }
    }
    if (typeof field === 'number' && schema[key].hasOwnProperty('max')) {
      if (field > schema[key].max) {
        result.message = `Field '${key}' should be at most ${schema[key].max}`;
        return result;
      }
    }
    if (typeof field === 'number' && schema[key].hasOwnProperty('step')) {
      if (field % schema[key].step !== 0) {
        if (schema[key].step === 1) {
          result.message = `Field '${key}' should be an integer`;
        } else {
          result.message = `Field '${key}' should be divisible by ${schema[key].step}`;
        }
        return result;
      }
    }

    // comparison constraints
    if (schema[key].hasOwnProperty('lt') && data.hasOwnProperty(schema[key].lt)) {
      if (field >= data[schema[key].lt]) {
        result.message = `Field '${key}' should be less than field '${schema[key].lt}'`;
        return result;
      }
    }
    if (schema[key].hasOwnProperty('lte') && data.hasOwnProperty(schema[key].lte)) {
      if (field > data[schema[key].lte]) {
        result.message = `Field '${key}' should be at most field '${schema[key].lte}'`;
        return result;
      }
    }
    if (schema[key].hasOwnProperty('gt') && data.hasOwnProperty(schema[key].gt)) {
      if (field <= data[schema[key].gt]) {
        result.message = `Field '${key}' should be greater than field '${schema[key].gt}'`;
        return result;
      }
    }
    if (schema[key].hasOwnProperty('gte') && data.hasOwnProperty(schema[key].gte)) {
      if (field < data[schema[key].gte]) {
        result.message = `Field '${key}' should be at least field '${schema[key].gte}'`;
        return result;
      }
    }
  }

  // validated!
  result.result = true;
  return result;
};


/*
 * validateTypes: utility function to type check a field
 *
 * returns `true` if the candidate is within the expected types, `false` if not
 *
 * candidate: the value of which to check the type
 * expectedTypes (array of strings): an array of valid type names for this
 *   field; e.g. 'number', 'date', 'boolean', etc
 */

function validateTypes(candidate, expectedTypes) {
  let result = false;
  for (const type of expectedTypes) {
    if (type === 'date' && typeof candidate.getMonth === 'function') {
      result = true;
    } else if (type === 'array' && candidate.constructor === Array) {
      result = true;
    } else if (typeof candidate === type) {
      result = true;
    }
  }
  return result;
}


/*
 * coerceTypes: changes strings (e.g. from a form submission) into
 * types that we can validate
 *
 * transforms the passed object
 *
 * data (object): the data to manipulate
 * schema (object): schema object defining fields and their constraints
 */

exports.coerceTypes = function (data, schema) {
  for (const key of Object.keys(data)) {
    const field = data[key];
    let tmp;

    if (!schema.hasOwnProperty(key)) {
      continue;
    }

    // numbers
    if (schema[key].types.includes('number')) {
      if (schema[key].hasOwnProperty('step') && schema[key].step === 1) {
        tmp = parseInt(field, 10);
      } else {
        tmp = parseFloat(field);
      }
      if (!isNaN(tmp)) {
        data[key] = tmp;
      }

    // arrays
    } else if (schema[key].types.includes('array')) {
      if (data[key].constructor !== Array) {
        data[key] = [].slice.call(data[key]);
      }

      // arrays of numbers
      if (schema[key].elementTypes.includes('number')) {
        data[key] = data[key].map(el => {
          let tmp = parseInt(el, 10);
          return isNaN(tmp) ? el : tmp;
        });
      }
    }
  }
};
