


function validateListCreation(data) {
  const errors = [];

  
  if (!data.title || !String(data.title).trim()) {
    errors.push("El título es obligatorio");
  } else if (String(data.title).trim().length > 100) {
    errors.push("El título no puede exceder 100 caracteres");
  }

  
  if (data.description && String(data.description).length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


function validateListUpdate(data) {
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

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateListCreation,
  validateListUpdate,
};
