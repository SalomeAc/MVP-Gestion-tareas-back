const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const TaskController = require("../controllers/taskController");


router.use(authenticateToken);


router.post("/", (req, res) => TaskController.createTask(req, res));


router.get("/", (req, res) => TaskController.getAllTasks(req, res));


router.get("/list/:listId", (req, res) => TaskController.getTasksByList(req, res));


router.get("/:id", (req, res) => TaskController.getTaskById(req, res));


router.put("/:id", (req, res) => TaskController.updateTask(req, res));


router.delete("/:id", (req, res) => TaskController.deleteTask(req, res));

module.exports = router;
