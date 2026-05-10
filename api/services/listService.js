/**
 * List Service layer.
 *
 * Encapsulates business logic for list operations.
 * Acts as an intermediary between controllers and data access layer (DAO).
 */

const ListDAO = require("../dao/listDAO");
const { validateListCreation, validateListUpdate } = require("../validators/listValidator");

class ListService {
  /**
   * Creates a new list for a user with business rule validation.
   *
   * @param {string} userId - The authenticated user's ID
   * @param {Object} listData - The list data from the request
   * @returns {Promise<Object>} The created list document
   * @throws {Object} Validation or database errors with appropriate messages
   */
  async createList(userId, listData) {
    // Normalize and clean input data
    const sanitizedData = this._sanitizeListData(listData);

    // Validate business rules
    const validation = validateListCreation(sanitizedData);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      // Persist list to database (associated with user)
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

      // Generic database error
      const error = new Error("Error al crear la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Updates an existing list with validation.
   *
   * @param {string} listId - The list ID to update
   * @param {string} userId - The authenticated user's ID
   * @param {Object} updateData - The fields to update
   * @returns {Promise<Object>} The updated list document
   * @throws {Object} Validation or database errors
   */
  async updateList(listId, userId, updateData) {
    // Normalize and clean input data
    const sanitizedData = this._sanitizeListData(updateData);

    // Validate business rules
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
        throw err; // Re-throw known errors
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

  /**
   * Retrieves a list by ID, ensuring it belongs to the user.
   *
   * @param {string} listId - The task ID
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Object|null>} The list document or null if not found
   */
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

  /**
   * Retrieves all lists for a user.
   *
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Array>} List of lists documents
   */
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

  /**
   * Deletes a list, ensuring it belongs to the user.
   *
   * @param {string} listId - The list ID
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Object|null>} The deleted list document or null if not found
   */
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
        throw err; // Re-throw known errors
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

  /**
   * Sanitizes and normalizes list data.
   * Trims strings, removes undefined/empty values, and applies defaults.
   *
   * @private
   * @param {Object} data - The raw list data
   * @returns {Object} The sanitized data
   */
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
