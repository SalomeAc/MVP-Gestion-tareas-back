const express = require("express");
const userRoutes = require("./userRoutes");
//const taskRoutes = require("./taskRoutes");
//const listRoutes = require("./listRoutes");

const router = express.Router();

/**
 * Mount project routes.
 */
router.use("/users", userRoutes);
//router.use("/tasks", taskRoutes);
//router.use("/lists", listRoutes);

/**
 * Export the main router instance.
 * This is imported in `index.js` and mounted under `/api/`.
 */
module.exports = router;
