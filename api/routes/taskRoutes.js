const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const TaskController = require("../controllers/taskController");

/**
 * All task routes require authentication.
 */
router.use(authenticateToken);

/**
 * @route POST /api/tasks
 * @description Create a task for the authenticated user
 * @access Private
 */
router.post("/", (req, res) => TaskController.createTask(req, res));

/**
 * @route GET /api/tasks
 * @description Get all tasks of the authenticated user
 * @access Private
 */
router.get("/", (req, res) => TaskController.getAllTasks(req, res));

/**
 * @route GET /api/tasks/:id
 * @description Get one task by id (owned by the authenticated user)
 * @access Private
 */
router.get("/:id", (req, res) => TaskController.getTaskById(req, res));

/**
 * @route PUT /api/tasks/:id
 * @description Update one task by id (owned by the authenticated user)
 * @access Private
 */
router.put("/:id", (req, res) => TaskController.updateTask(req, res));

/**
 * @route DELETE /api/tasks/:id
 * @description Hard-delete one task by id (owned by the authenticated user)
 * @access Private
 */
router.delete("/:id", (req, res) => TaskController.deleteTask(req, res));

module.exports = router;
