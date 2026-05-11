const mongoose = require("mongoose");
const GlobalController = require("./globalController");
const ListService = require("../services/listService");

class ListController extends GlobalController {
  async createList(req, res) {
    try {
      console.log(`[ListController] Creating list for user: ${req.user.id}`);

      const list = await ListService.createList(req.user.id, req.body);

      return res.status(201).json(list);
    } catch (err) {
      if (err.statusCode === 400) {
        console.warn(`[ListController] Validation error: ${err.message}`);
        return res.status(400).json({
          message: err.message,
          ...(err.validationErrors && { errors: err.validationErrors }),
        });
      }

      console.error(`[ListController] Unexpected error creating list: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async getAllLists(req, res) {
    try {
      console.log(`[ListController] Fetching lists for user: ${req.user.id}`);

      const lists = await ListService.getAllLists(req.user.id);

      return res.status(200).json(lists);
    } catch (err) {
      if (err.statusCode === 500) {
        console.error(`[ListController] Error fetching lists: ${err.message}`);
      }

      return res.status(err.statusCode || 500).json({ message: err.message || "Error interno del servidor" });
    }
  }

  async getListById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de lista inválido" });
      }

      console.log(`[ListController] Fetching list ${id} for user: ${req.user.id}`);

      const list = await ListService.getListById(id, req.user.id);

      if (!list) {
        return res.status(404).json({ message: "Lista no encontrada" });
      }

      return res.status(200).json(list);
    } catch (err) {
      if (err.statusCode === 500) {
        console.error(`[ListController] Error fetching list: ${err.message}`);
      }

      return res.status(err.statusCode || 500).json({ message: err.message || "Error interno del servidor" });
    }
  }

  async updateList(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de lista inválido" });
      }

      console.log(`[ListController] Updating list ${id} for user: ${req.user.id}`);

      const list = await ListService.updateList(id, req.user.id, req.body);

      return res.status(200).json(list);
    } catch (err) {
      if (err.statusCode === 400) {
        console.warn(`[ListController] Validation error: ${err.message}`);
        return res.status(400).json({
          message: err.message,
          ...(err.validationErrors && { errors: err.validationErrors }),
        });
      }

      if (err.statusCode === 404) {
        return res.status(404).json({ message: err.message });
      }

      console.error(`[ListController] Error updating list: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteList(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de lista inválido" });
      }

      console.log(`[ListController] Deleting list ${id} for user: ${req.user.id}`);

      const list = await ListService.deleteList(id, req.user.id);

      return res.status(200).json({ message: "Lista eliminada correctamente", list });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ message: err.message });
      }

      console.error(`[ListController] Error deleting list: ${err.message}`);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = new ListController();

