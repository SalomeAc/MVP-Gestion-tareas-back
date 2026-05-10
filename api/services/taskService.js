/**
 * Task Service layer.
 *
 * Encapsulates business logic for task operations.
 * Acts as an intermediary between controllers and data access layer (DAO).
 */

const mongoose = require("mongoose");
const TaskDAO = require("../dao/taskDAO");
const ListDAO = require("../dao/listDAO");
const { validateTaskCreation, validateTaskUpdate } = require("../validators/taskValidator");

class TaskService {
  /**
   * Creates a new task for a user with business rule validation.
   *
   * @param {string} userId - The authenticated user's ID
   * @param {Object} taskData - The task data from the request
   * @returns {Promise<Object>} The created task document
   * @throws {Object} Validation or database errors with appropriate messages
   */
  async createTask(userId, taskData) {
    // Normalize and clean input data
    const sanitizedData = this._sanitizeTaskData(taskData);

    await this._resolveListAssociation(userId, sanitizedData.list);

    // Validate business rules
    const validation = validateTaskCreation(sanitizedData);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      // Persist task to database (associated with user)
      const task = await TaskDAO.createForUser(userId, sanitizedData);

      if (task.list) {
        await task.populate("list", "title description");
      }

      console.log(`[TaskService] Task created successfully. TaskID: ${task._id}, UserID: ${userId}`);

      return task;
    } catch (err) {
      console.error(`[TaskService] Error creating task for user ${userId}:`, err.message);

      if (err.name === "ValidationError") {
        const mongoErrors = Object.values(err.errors).map((e) => e.message);
        const error = new Error(mongoErrors[0]);
        error.statusCode = 400;
        error.validationErrors = mongoErrors;
        throw error;
      }

      // Generic database error
      const error = new Error("Error al crear la tarea");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Updates an existing task with validation.
   *
   * @param {string} taskId - The task ID to update
   * @param {string} userId - The authenticated user's ID
   * @param {Object} updateData - The fields to update
   * @returns {Promise<Object>} The updated task document
   * @throws {Object} Validation or database errors
   */
  async updateTask(taskId, userId, updateData) {
    // Normalize and clean input data
    const sanitizedData = this._sanitizeTaskData(updateData);

    await this._resolveListAssociation(userId, sanitizedData.list);

    // Validate business rules
    const validation = validateTaskUpdate(sanitizedData);
    if (!validation.isValid) {
      const error = new Error(validation.errors[0]);
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      const task = await TaskDAO.updateByIdForUser(taskId, userId, sanitizedData);

      if (task && task.list) {
        await task.populate("list", "title description");
      }

      if (!task) {
        const error = new Error("Tarea no encontrada");
        error.statusCode = 404;
        throw error;
      }

      console.log(`[TaskService] Task updated successfully. TaskID: ${taskId}, UserID: ${userId}`);

      return task;
    } catch (err) {
      if (err.statusCode) {
        throw err; // Re-throw known errors
      }

      console.error(
        `[TaskService] Error updating task ${taskId} for user ${userId}:`,
        err.message,
      );

      if (err.name === "ValidationError") {
        const mongoErrors = Object.values(err.errors).map((e) => e.message);
        const error = new Error(mongoErrors[0]);
        error.statusCode = 400;
        error.validationErrors = mongoErrors;
        throw error;
      }

      const error = new Error("Error al actualizar la tarea");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Retrieves a task by ID, ensuring it belongs to the user.
   *
   * @param {string} taskId - The task ID
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Object|null>} The task document or null if not found
   */
  async getTaskById(taskId, userId) {
    try {
      return await TaskDAO.getByIdForUser(taskId, userId);
    } catch (err) {
      console.error(`[TaskService] Error fetching task ${taskId} for user ${userId}:`, err.message);

      const error = new Error("Error al obtener la tarea");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Retrieves all tasks for a user.
   *
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Array>} List of task documents
   */
  async getAllTasks(userId) {
    try {
      return await TaskDAO.getAllByUser(userId);
    } catch (err) {
      console.error(`[TaskService] Error fetching tasks for user ${userId}:`, err.message);

      const error = new Error("Error al obtener las tareas");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Deletes a task, ensuring it belongs to the user.
   *
   * @param {string} taskId - The task ID
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Object|null>} The deleted task document or null if not found
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await TaskDAO.deleteByIdForUser(taskId, userId);

      if (!task) {
        const error = new Error("Tarea no encontrada");
        error.statusCode = 404;
        throw error;
      }

      console.log(`[TaskService] Task deleted successfully. TaskID: ${taskId}, UserID: ${userId}`);

      return task;
    } catch (err) {
      if (err.statusCode) {
        throw err; // Re-throw known errors
      }

      console.error(
        `[TaskService] Error deleting task ${taskId} for user ${userId}:`,
        err.message,
      );

      const error = new Error("Error al eliminar la tarea");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Retrieves all tasks for a list owned by the authenticated user.
   *
   * @param {string} listId - The list ID
   * @param {string} userId - The authenticated user's ID
   * @returns {Promise<Array>} List of task documents
   */
  async getTasksByList(listId, userId) {
    await this._resolveListAssociation(userId, listId);

    try {
      return await TaskDAO.getAllByListAndUser(listId, userId);
    } catch (err) {
      console.error(`[TaskService] Error fetching tasks for list ${listId} and user ${userId}:`, err.message);

      const error = new Error("Error al obtener las tareas de la lista");
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Sanitizes and normalizes task data.
   * Trims strings, removes undefined/empty values, and applies defaults.
   *
   * @private
   * @param {Object} data - The raw task data
   * @returns {Object} The sanitized data
   */
  _sanitizeTaskData(data) {
    const sanitized = {};

    if (data.title !== undefined) {
      sanitized.title = String(data.title).trim();
    }

    if (data.description !== undefined) {
      sanitized.description = String(data.description).trim();
    }

    if (data.dueDate !== undefined && data.dueDate !== null && data.dueDate !== "") {
      sanitized.dueDate = data.dueDate;
    }

    if (data.list !== undefined) {
      sanitized.list = data.list === null || data.list === "" ? null : String(data.list).trim();
    }

    if (data.status !== undefined) {
      sanitized.status = String(data.status).toLowerCase();
    }

    return sanitized;
  }

  /**
   * Validates a list association when present and ensures the list belongs to the user.
   *
   * @private
   * @param {string} userId
   * @param {string|null|undefined} listId
   */
  async _resolveListAssociation(userId, listId) {
    if (listId === undefined || listId === null || listId === "") {
      return null;
    }

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      const error = new Error("ID de lista inválido");
      error.statusCode = 400;
      throw error;
    }

    const list = await ListDAO.getByIdForUser(listId, userId);

    if (!list) {
      const error = new Error("Lista no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return list;
  }
}

module.exports = new TaskService();
