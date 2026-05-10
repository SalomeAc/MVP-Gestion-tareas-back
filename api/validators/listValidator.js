/**
 * List validation utilities.
 *
 * Provides business rule validations for lists.
 * These validations are independent of framework and database layer.
 */

/**
 * Validates list creation request data.
 *
 * @param {Object} data - The request data to validate
 * @param {string} data.title - List title
 * @param {string} [data.description] - List description
 * @param {Date|string} [data.dueDate] - List due date
 * @param {string} [data.status] - List status
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateListCreation(data) {
  const errors = [];

  // Validate title
  if (!data.title || !String(data.title).trim()) {
    errors.push("El título es obligatorio");
  } else if (String(data.title).trim().length > 100) {
    errors.push("El título no puede exceder 100 caracteres");
  }

  // Validate description if provided
  if (data.description && String(data.description).length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates list update request data.
 *
 * @param {Object} data - The request data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateListUpdate(data) {
  const errors = [];

  // Validate title if provided
  if (data.title !== undefined) {
    if (!String(data.title).trim()) {
      errors.push("El título no puede estar vacío");
    } else if (String(data.title).trim().length > 100) {
      errors.push("El título no puede exceder 100 caracteres");
    }
  }

  // Validate description if provided
  if (data.description && String(data.description).length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateListCreation,
  validateListUpdate,
};
