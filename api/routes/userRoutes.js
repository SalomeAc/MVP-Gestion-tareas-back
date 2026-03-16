const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");

const UserController = require("../controllers/userController");

/**
 * @route GET /api/users/profile
 * @description Retrieve a user's profile info by ID.
 * @access Private (requires valid JWT)
 */
router.get("/user-profile", authenticateToken, (req, res) =>
  UserController.getUserProfile(req, res),
);

/**
 * @route POST /api/users/
 * @description Create a user.
 * @body {string} firstName - The first name of the user.
 * @body {string} lastName - The last name of the user.
 * @body {int} age - The age of the user.
 * @body {string} email - The email of the user.
 * @body {string} password - The password of the user.
 * @body {string} confirmPassword - The password of the user.
 * @access Public
 */
router.post("/", (req, res) => UserController.registerUser(req, res));

/**
 * @route POST /api/users/login
 * @description Login a user and return a JWT token.
 * @body {string} email - The user's email.
 * @body {string} password - The user's password.
 * @access Public
 */
router.post("/login", (req, res) => UserController.loginUser(req, res));

/**
 * @route PUT /api/users/update-profile
 * @description Update an existing user by ID.
 * @body {string} [username] - Updated username (optional).
 * @body {string} [password] - Updated password (optional).
 * @access Private (requires valid JWT)
 */
router.put("/update-profile", authenticateToken, (req, res) =>
  UserController.updateUserProfile(req, res),
);

/**
 * @route DELETE /api/users/delete-user
 * @description Delete a user by ID.
 * @access Private (requires valid JWT
 */
router.delete("/delete-user", authenticateToken, (req, res) =>
  UserController.deleteUser(req, res),
);

/**
 * @route POST /api/users/forgot-password
 * @description Send a password reset link to user's email.
 * @body {string} email - The user's email.
 * @access Public
 */
router.post("/recover-password", (req, res) =>
  UserController.forgotPassword(req, res),
);

/**
 * @route POST /api/users/reset-password/:token
 * @description Reset password using token from email.
 * @param {string} token - The reset token sent by email.
 * @body {string} newPassword - The new password.
 * @body {string} confirmPassword - Confirmation of the new password.
 * @access Public
 */
router.post("/reset-password/:token", (req, res) =>
  UserController.resetPassword(req, res),
);

/**
 * Export the router instance to be mounted in the main routes file.
 */
module.exports = router;
