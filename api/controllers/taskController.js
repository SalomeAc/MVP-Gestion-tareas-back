const mongoose = require("mongoose");
const GlobalController = require("./globalController");
const TaskService = require("../services/taskService");


class TaskController extends GlobalController {
  
  async createTask(req, res) {
    try {
      console.log(`[TaskController] Creating task for user: ${req.user.id}`);

      const task = await TaskService.createTask(req.user.id, req.body);

      return res.status(201).json(task);
    } catch (err) {
      
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

