'use strict';

exports.validate = function (data, schema, required) {
  let result = { result: false, message: '' };

  // do a cursory check for required fields
  if (required && required.length > 0) {
    for (const field of required) {
      if (!data.hasOwnProperty(field)) {
        result.message = `Missing required field: '${field}'`;
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
    let typesValidated = false;
    for (const type of schema[key].types) {
      if (type === 'date' && typeof field.getMonth === 'function') {
        typesValidated = true;
      } else if (typeof field === type) {
        typesValidated = true;
      }
    }
    if (!typesValidated) {
      result.message = `Expected field '${field}' to be a ${schema[key].types.join(' or ')}`;
      return result;
    }

    // string or collection length constraints
    if (schema[key].hasOwnProperty('minLength')) {
      if (field.length < schema[key].minLength) {
        result.message = `Field '${field}' should have a minimum length of ${schema[key].minLength}`;
        return result;
      }
    }
    if (schema[key].hasOwnProperty('maxLength')) {
      if (field.length > schema[key].maxLength) {
        result.message = `Field '${field}' should have a maximum length of ${schema[key].maxLength}`;
        return result;
      }
    }

    // string regex
    if (schema[key].hasOwnProperty('regex')) {
      if (!schema[key].regex.test(field)) {
        result.message = `Field ${field} should conform to ${schema[key].regex.toString()}`;
        return result;
      }
    }

    // number min, max, and step constraints
    if (typeof field === 'number' && schema[key].hasOwnProperty('min')) {
      if (field < schema[key].min) {
        result.message = `Field '${field}' should be at least ${schema[key].min}`;
        return result;
      }
    }
    if (typeof field === 'number' && schema[key].hasOwnProperty('max')) {
      if (field > schema[key].max) {
        result.message = `Field '${field}' should be at most ${schema[key].max}`;
        return result;
      }
    }
    if (typeof field === 'number' && schema[key].hasOwnProperty('step')) {
      if (field % schema[key].step !== 0) {
        if (schema[key].step === 1) {
          result.message = `Field '${field}' should be an integer`;
        } else {
          result.message = `Field '${field}' should be divisible by ${schema[key].step}`;
        }
        return result;
      }
    }
  }

  // validated!
  result.result = true;
  return result;
};
