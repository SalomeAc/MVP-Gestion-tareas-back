/**
 * Task validation utilities.
 *
 * Provides business rule validations for tasks.
 * These validations are independent of framework and database layer.
 */

const ALLOWED_TASK_STATUS = ["pendiente", "en curso", "finalizada"];

/**
 * Validates task creation request data.
 *
 * @param {Object} data - The request data to validate
 * @param {string} data.title - Task title
 * @param {string} [data.description] - Task description
 * @param {Date|string} [data.dueDate] - Task due date
 * @param {string} [data.status] - Task status
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateTaskCreation(data) {
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

  // Validate dueDate if provided
  if (data.dueDate !== undefined && data.dueDate !== null && data.dueDate !== "") {
    const parsedDate = new Date(data.dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("El formato de fecha límite es inválido");
    } else {
      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (parsedDate < today) {
        errors.push("La fecha límite no puede ser una fecha pasada");
      }
    }
  }

  // Validate status if provided
  if (data.status && !ALLOWED_TASK_STATUS.includes(String(data.status).toLowerCase())) {
    errors.push(`El estado es inválido. Valores permitidos: ${ALLOWED_TASK_STATUS.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates task update request data.
 *
 * @param {Object} data - The request data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateTaskUpdate(data) {
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

  // Validate dueDate if provided
  if (data.dueDate !== undefined && data.dueDate !== null && data.dueDate !== "") {
    const parsedDate = new Date(data.dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("El formato de fecha límite es inválido");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (parsedDate < today) {
        errors.push("La fecha límite no puede ser una fecha pasada");
      }
    }
  }

  // Validate status if provided
  if (data.status && !ALLOWED_TASK_STATUS.includes(String(data.status).toLowerCase())) {
    errors.push(`El estado es inválido. Valores permitidos: ${ALLOWED_TASK_STATUS.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateTaskCreation,
  validateTaskUpdate,
  ALLOWED_TASK_STATUS,
};
