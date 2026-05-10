const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate requests using a JWT token.
 *
 * Checks for a token in the `Authorization` header,
 * verifies it, and attaches the decoded payload to `req.user`.
 * If no token is provided or verification fails, returns an error response.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {void} Sends a 401 or 403 response if authentication fails, otherwise calls next().
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extracts token after 'Bearer '

  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next(); // Continues to the next handler
  });
}

/**
 * Export a singleton instance of authenticateToken.
 */
module.exports = authenticateToken;
