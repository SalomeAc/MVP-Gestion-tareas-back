

const ListDAO = require("../dao/listDAO");
const { validateListCreation, validateListUpdate } = require("../validators/listValidator");

class ListService {
  
  async createList(userId, listData) {
    
    const sanitizedData = this._sanitizeListData(listData);

    
    const validation = validateListCreation(sanitizedData);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      
      const list = await ListDAO.createForUser(userId, sanitizedData);

      console.log(`[ListService] List created successfully. ListID: ${list._id}, UserID: ${userId}`);

      return list;
    } catch (err) {
      console.error(`[ListService] Error creating list for user ${userId}:`, err.message);

      if (err.name === "ValidationError") {
        const mongoErrors = Object.values(err.errors).map((e) => e.message);
        const error = new Error(mongoErrors[0]);
        error.statusCode = 400;
        error.validationErrors = mongoErrors;
        throw error;
      }

      
      const error = new Error("Error al crear la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  
  async updateList(listId, userId, updateData) {
    
    const sanitizedData = this._sanitizeListData(updateData);

    
    const validation = validateListUpdate(sanitizedData);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      const list = await ListDAO.updateByIdForUser(listId, userId, sanitizedData);

      if (!list) {
        const error = new Error("Lista no encontrada");
        error.statusCode = 404;
        throw error;
      }

      console.log(`[ListService] List updated successfully. ListID: ${listId}, UserID: ${userId}`);

      return list;
    } catch (err) {
      if (err.statusCode) {
        throw err; 
      }

      console.error(
        `[ListService] Error updating list ${listId} for user ${userId}:`,
        err.message,
      );

      if (err.name === "ValidationError") {
        const mongoErrors = Object.values(err.errors).map((e) => e.message);
        const error = new Error(mongoErrors[0]);
        error.statusCode = 400;
        error.validationErrors = mongoErrors;
        throw error;
      }

      const error = new Error("Error al actualizar la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  
  async getListById(listId, userId) {
    try {
      return await ListDAO.getByIdForUser(listId, userId);
    } catch (err) {
      console.error(`[ListService] Error fetching list ${listId} for user ${userId}:`, err.message);

      const error = new Error("Error al obtener la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  
  async getAllLists(userId) {
    try {
      return await ListDAO.getAllByUser(userId);
    } catch (err) {
      console.error(`[ListService] Error fetching lists for user ${userId}:`, err.message);

      const error = new Error("Error al obtener las listas");
      error.statusCode = 500;
      throw error;
    }
  }

  
  async deleteList(listId, userId) {
    try {
      const list = await ListDAO.deleteByIdForUser(listId, userId);

      if (!list) {
        const error = new Error("Lista no encontrada");
        error.statusCode = 404;
        throw error;
      }

      console.log(`[ListService] List deleted successfully. ListID: ${listId}, UserID: ${userId}`);

      return list;
    } catch (err) {
      if (err.statusCode) {
        throw err; 
      }

      console.error(
        `[ListService] Error deleting list ${listId} for user ${userId}:`,
        err.message,
      );

      const error = new Error("Error al eliminar la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  
  _sanitizeListData(data) {
    const sanitized = {};

    if (data.title !== undefined) {
      sanitized.title = String(data.title).trim();
    }

    if (data.description !== undefined) {
      sanitized.description = String(data.description).trim();
    }

    return sanitized;
  }
}

module.exports = new ListService();
