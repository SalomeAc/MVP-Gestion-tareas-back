

const ALLOWED_TASK_STATUS = ["pendiente", "en curso", "finalizada"];


function validateTaskCreation(data) {
  const errors = [];

  
  if (!data.title || !String(data.title).trim()) {
    errors.push("El título es obligatorio");
  } else if (String(data.title).trim().length > 100) {
    errors.push("El título no puede exceder 100 caracteres");
  }

  
  if (data.description && String(data.description).length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  
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

  
  if (data.status && !ALLOWED_TASK_STATUS.includes(String(data.status).toLowerCase())) {
    errors.push(`El estado es inválido. Valores permitidos: ${ALLOWED_TASK_STATUS.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


function validateTaskUpdate(data) {
  const errors = [];

  
  if (data.title !== undefined) {
    if (!String(data.title).trim()) {
      errors.push("El título no puede estar vacío");
    } else if (String(data.title).trim().length > 100) {
      errors.push("El título no puede exceder 100 caracteres");
    }
  }

  
  if (data.description && String(data.description).length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  
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
