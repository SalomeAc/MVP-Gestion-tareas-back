const express = require("express");
const userRoutes = require("./userRoutes");
const taskRoutes = require("./taskRoutes");
const listRoutes = require("./listRoutes");

const router = express.Router();


router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/lists", listRoutes);



router.get("/", (req, res) => {
  res.send("API funcionando");
});


module.exports = router;
