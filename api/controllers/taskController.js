const mongoose = require("mongoose");
const GlobalController = require("./globalController");
const TaskService = require("../services/taskService");

/**
 * Controller for task CRUD operations.
 * All operations are scoped to the authenticated user.
 *
 * Acts as the HTTP request/response handler, delegating business logic to the service layer.
 */
class TaskController extends GlobalController {
  /**
   * Creates a new task for the authenticated user.
   *
   * @route POST /api/tasks
   * @param {import("express").Request} req - Express request with body and user from auth middleware
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response
   *
   * @example
   * POST /api/tasks
   * Authorization: Bearer <token>
   * {
   *   "title": "Implement HU-03",
   *   "description": "Create task endpoint",
   *   "dueDate": "2024-05-15",
   *   "status": "pendiente"
   * }
   *
   * Response: 201 Created
   * {
   *   "_id": "507f1f77bcf86cd799439011",
   *   "title": "Implement HU-03",
   *   "description": "Create task endpoint",
   *   "dueDate": "2024-05-15T00:00:00.000Z",
   *   "status": "pendiente",
   *   "user": "507f1f77bcf86cd799439010",
   *   "createdAt": "2024-04-25T10:00:00.000Z",
   *   "updatedAt": "2024-04-25T10:00:00.000Z"
   * }
   */
  async createTask(req, res) {
    try {
      console.log(`[TaskController] Creating task for user: ${req.user.id}`);

      const task = await TaskService.createTask(req.user.id, req.body);

      return res.status(201).json(task);
    } catch (err) {
      // Handle service layer errors
      if (err.statusCode === 400) {
        console.warn(`[TaskController] Validation error: ${err.message}`);
        return res.status(400).json({
          message: err.message,
          ...(err.validationErrors && { errors: err.validationErrors }),
        });
      }

      console.error(`[TaskController] Unexpected error creating task: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }


  /**
   * Retrieves all tasks for the authenticated user.
   *
   * @route GET /api/tasks
   * @param {import("express").Request} req - Express request with user from auth middleware
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with tasks array
   */
  async getAllTasks(req, res) {
    try {
      console.log(`[TaskController] Fetching tasks for user: ${req.user.id}`);

      const tasks = await TaskService.getAllTasks(req.user.id);

      return res.status(200).json(tasks);
    } catch (err) {
      if (err.statusCode === 500) {
        console.error(`[TaskController] Error fetching tasks: ${err.message}`);
      }

      return res.status(err.statusCode || 500).json({ message: err.message || "Error interno del servidor" });
    }
  }

  /**
   * Retrieves all tasks for a specific list and user.
   *
   * @route GET /api/tasks/list/:listId
   * @param {import("express").Request} req - Express request with list ID in params
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with tasks array
   */
  async getTasksByList(req, res) {
    try {
      const { listId } = req.params;

      console.log(`[TaskController] Fetching tasks for list ${listId} and user: ${req.user.id}`);

      const tasks = await TaskService.getTasksByList(listId, req.user.id);

      return res.status(200).json(tasks);
    } catch (err) {
      if (err.statusCode === 400 || err.statusCode === 404) {
        return res.status(err.statusCode).json({ message: err.message });
      }

      if (err.statusCode === 500) {
        console.error(`[TaskController] Error fetching tasks by list: ${err.message}`);
      }

      return res.status(err.statusCode || 500).json({ message: err.message || "Error interno del servidor" });
    }
  }

  /**
   * Retrieves one task by id for the authenticated user.
   *
   * @route GET /api/tasks/:id
   * @param {import("express").Request} req - Express request with task ID in params
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with task
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea inválido" });
      }

      console.log(`[TaskController] Fetching task ${id} for user: ${req.user.id}`);

      const task = await TaskService.getTaskById(id, req.user.id);

      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }

      return res.status(200).json(task);
    } catch (err) {
      if (err.statusCode === 500) {
        console.error(`[TaskController] Error fetching task: ${err.message}`);
      }

      return res.status(err.statusCode || 500).json({ message: err.message || "Error interno del servidor" });
    }
  }

  /**
   * Updates one task by id for the authenticated user.
   *
   * @route PUT /api/tasks/:id
   * @param {import("express").Request} req - Express request with task ID and update data
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with updated task
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea inválido" });
      }

      console.log(`[TaskController] Updating task ${id} for user: ${req.user.id}`);

      const task = await TaskService.updateTask(id, req.user.id, req.body);

      return res.status(200).json(task);
    } catch (err) {
      if (err.statusCode === 400) {
        console.warn(`[TaskController] Validation error: ${err.message}`);
        return res.status(400).json({
          message: err.message,
          ...(err.validationErrors && { errors: err.validationErrors }),
        });
      }

      if (err.statusCode === 404) {
        return res.status(404).json({ message: err.message });
      }

      console.error(`[TaskController] Error updating task: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  /**
   * Hard-deletes one task by id for the authenticated user.
   *
   * @route DELETE /api/tasks/:id
   * @param {import("express").Request} req - Express request with task ID in params
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response confirming deletion
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea inválido" });
      }

      console.log(`[TaskController] Deleting task ${id} for user: ${req.user.id}`);

      const task = await TaskService.deleteTask(id, req.user.id);

      return res.status(200).json({ message: "Tarea eliminada correctamente", task });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ message: err.message });
      }

      console.error(`[TaskController] Error deleting task: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = new TaskController();

