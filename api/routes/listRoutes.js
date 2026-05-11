const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const ListController = require("../controllers/listController");
const TaskController = require("../controllers/taskController");


router.use(authenticateToken);


router.post("/", (req, res) => ListController.createList(req, res));


router.get("/", (req, res) => ListController.getAllLists(req, res));


router.get("/get-tasks/:listId", (req, res) => TaskController.getTasksByList(req, res));


router.get("/:id", (req, res) => ListController.getListById(req, res));


router.put("/:id", (req, res) => ListController.updateList(req, res));


router.delete("/:id", (req, res) => ListController.deleteList(req, res));

module.exports = router;
