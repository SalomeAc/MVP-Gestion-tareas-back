const mongoose = require("mongoose");
const GlobalController = require("./globalController");
const TaskDAO = require("../dao/taskDAO");
const { ALLOWED_TASK_STATUS } = require("../models/task");

/**
 * Controller for task CRUD operations.
 * All operations are scoped to the authenticated user.
 */
class TaskController extends GlobalController {
  constructor() {
    super(TaskDAO);
  }

  /**
   * Creates a new task for the authenticated user.
   */
  async createTask(req, res) {
    try {
      const { title, description, dueDate, status } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "El titulo es obligatorio" });
      }

      if (status && !ALLOWED_TASK_STATUS.includes(status)) {
        return res.status(400).json({
          message: "Estado invalido. Valores permitidos: pendiente, en progreso, completada",
        });
      }

      if (dueDate !== undefined && dueDate !== null && dueDate !== "" && Number.isNaN(Date.parse(dueDate))) {
        return res.status(400).json({ message: "Formato de fecha limite invalido" });
      }

      const taskData = {
        title: String(title).trim(),
      };

      if (description !== undefined) taskData.description = description;
      if (status !== undefined) taskData.status = status;
      if (dueDate !== undefined && dueDate !== "") taskData.dueDate = dueDate;

      const task = await this.dao.createForUser(req.user.id, taskData);

      return res.status(201).json(task);
    } catch (err) {
      if (err.name === "ValidationError") {
        const firstMessage = Object.values(err.errors)[0].message;
        return res.status(400).json({ message: firstMessage });
      }

      console.error("Error creating task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Retrieves all tasks for the authenticated user.
   */
  async getAllTasks(req, res) {
    try {
      const tasks = await this.dao.getAllByUser(req.user.id);
      return res.status(200).json(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Retrieves one task by id for the authenticated user.
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea invalido" });
      }

      const task = await this.dao.getByIdForUser(id, req.user.id);

      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }

      return res.status(200).json(task);
    } catch (err) {
      console.error("Error fetching task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Updates one task by id for the authenticated user.
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, dueDate, status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea invalido" });
      }

      if (title !== undefined && !String(title).trim()) {
        return res.status(400).json({ message: "El titulo es obligatorio" });
      }

      if (status !== undefined && !ALLOWED_TASK_STATUS.includes(status)) {
        return res.status(400).json({
          message: "Estado invalido. Valores permitidos: pendiente, en progreso, completada",
        });
      }

      if (dueDate !== undefined && dueDate !== null && dueDate !== "" && Number.isNaN(Date.parse(dueDate))) {
        return res.status(400).json({ message: "Formato de fecha limite invalido" });
      }

      const updateData = {};

      if (title !== undefined) updateData.title = String(title).trim();
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (dueDate !== undefined) updateData.dueDate = dueDate === "" ? null : dueDate;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No hay campos para actualizar" });
      }

      const task = await this.dao.updateByIdForUser(id, req.user.id, updateData);

      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }

      return res.status(200).json(task);
    } catch (err) {
      if (err.name === "ValidationError") {
        const firstMessage = Object.values(err.errors)[0].message;
        return res.status(400).json({ message: firstMessage });
      }

      console.error("Error updating task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Hard-deletes one task by id for the authenticated user.
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de tarea invalido" });
      }

      const task = await this.dao.deleteByIdForUser(id, req.user.id);

      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }

      return res.status(200).json({ message: "Tarea eliminada correctamente" });
    } catch (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new TaskController();
