const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const ListController = require("../controllers/listController");

/**
 * All list routes require authentication.
 */
router.use(authenticateToken);

/**
 * @route POST /api/lists
 * @description Create a list for the authenticated user
 * @access Private
 */
router.post("/", (req, res) => ListController.createList(req, res));

/**
 * @route GET /api/lists
 * @description Get all lists of the authenticated user
 * @access Private
 */
router.get("/", (req, res) => ListController.getAllLists(req, res));

/**
 * @route GET /api/lists/:id
 * @description Get one list by id (owned by the authenticated user)
 * @access Private
 */
router.get("/:id", (req, res) => ListController.getListById(req, res));

/**
 * @route PUT /api/lists/:id
 * @description Update one lists by id (owned by the authenticated user)
 * @access Private
 */
router.put("/:id", (req, res) => ListController.updateList(req, res));

/**
 * @route DELETE /api/lists/:id
 * @description Hard-delete one list by id (owned by the authenticated user)
 * @access Private
 */
router.delete("/:id", (req, res) => ListController.deleteList(req, res));

module.exports = router;
