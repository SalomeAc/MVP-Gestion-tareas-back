const GlobalController = require("./globalController");
const UserDAO = require("../dao/userDAO");
//const ListDAO = require("../dao/listDAO");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/mailer");

/**
 * Controller class for managing User resources.
 *
 * Extends the generic {@link GlobalController} to inherit
 * CRUD operations, using the {@link UserDAO} as the data access layer.
 */
class UserController extends GlobalController {
  /**
   * Create a new UserController instance.
   *
   * The constructor passes the UserDAO to the parent class so that
   * all inherited methods (create, read, update, delete, getAll)
   * operate on the User model.
   */
  constructor() {
    super(UserDAO);
  }

  /**
   * Registers a new user and creates a default task list for them.
   *
   * @async
   * @param {import("express").Request} req - Express request object containing user data in `req.body`
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Returns HTTP status codes:
   *   - 201: User created successfully
   *   - 400: Validation error (e.g., required fields missing or invalid)
   *   - 409: Duplicate email
   *   - 500: Internal server error
   */
  async registerUser(req, res) {
    const { password, confirmPassword, ...rest } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    try {
      const user = await this.dao.create({ ...rest, password });

      return res.status(201).json({ message: "Registro exitoso" });

    } catch (err) {
      if (err.name === "ValidationError") {
        const firstMessage = Object.values(err.errors)[0].message;
        return res.status(400).json({ message: firstMessage });
      }

      if (err.code === 11000) {
        return res.status(409).json({ message: "Email ya registrado" });
      }

      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Authenticates a user with email and password, returning a JWT token.
   *
   * @async
   * @param {import("express").Request} req - Express request object containing `email` and `password` in `req.body`
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Returns HTTP status codes:
   *   - 200: Login successful, returns `{ token }`
   *   - 400: Missing email or password
   *   - 401: Email or password incorrect
   *   - 500: Internal server error
   */
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // 1. Validación básica
      if (!email || !password) {
        return res.status(400).json({
          message: "Email y contraseña requeridos",
        });
      }

      // 2. Buscar usuario
      const user = await this.dao.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          message: "Email o contraseña incorrectos",
        });
      }

      //  para HU-13
      if (user.isActive === false) {
        return res.status(403).json({
          message: "Usuario desactivado",
        });
      }

      // 3. Comparar contraseña
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Email o contraseña incorrectos",
        });
      }

      // 4. Generar token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 5. Respuesta
      return res.status(200).json({
        message: "Login exitoso",
        token,
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  /**
   * Retrieves the profile information of the currently authenticated user.
   *
   * Requires authentication via {@link authenticateToken}.
   *
   * @async
   * @param {import("express").Request} req - Express request object, `req.user` contains decoded JWT info
   * @param {import("express").Response} res - Express response object
   * @returns {Promise<void>} Returns HTTP status codes:
   *   - 200: Returns user profile `{ firstName, lastName, age, email }`
   *   - 404: User not found
   *   - 500: Internal server error
   */
  async getUserProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await this.dao.read(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Internal server error: ${err.message}`);
      }
      res
        .status(500)
        .json({ message: "Internal server error, try again later" });
    }
  }

  /**
   * Updates the profile of the authenticated user.
   *
   * Retrieves the user ID from the decoded JWT token (`req.user.id`) and
   * updates the user's document in the database with the data provided
   * in `req.body`. Only updates fields allowed by the model validators.
   *
   * @async
   * @param {import("express").Request} req - Express request object. The body should
   * contain the fields to update (e.g., firstName, lastName, age, email, password).
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with a success message or an error.
   */
  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const password = req.body.password;
      const confirmPassword = req.body.confirmPassword;

      if (password) {
        if (password !== confirmPassword) {
          return res
            .status(400)
            .json({ message: "Las contraseñas no coinciden" });
        }
      }

      const user = await this.dao.read(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await this.dao.update(userId, req.body);

      return res.status(200).json({
        message: "Perfil exitosamente actualizado",
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const firstMessage = Object.values(err.errors)[0].message;
        return res.status(400).json({ message: firstMessage });
      }

      if (err.code === 11000) {
        return res.status(409).json({ message: "Email ya registrado" });
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`Internal server error: ${err.message}`);
      }
      res
        .status(500)
        .json({ message: "Internal server error, try again later" });
    }
  }

  /**
   * Deletes the profile of the authenticated user.
   *
   * Retrieves the user ID from the decoded JWT token (`req.user.id`) and
   * deletes the user's document from the database.
   *
   * @async
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>} Sends a JSON response with a success message or an error.
   */
  async deleteUser(req, res) {
    try {
      const userId = req.user.id;

      const user = await this.dao.read(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await this.dao.delete(userId);

      return res.status(200).json({
        message: "Perfil exitosamente borrado",
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Internal server error: ${err.message}`);
      }
      res
        .status(500)
        .json({ message: "Internal server error, try again later" });
    }
  }
  /**
   * Resets the user password using the reset token.
   *
   * @async
   * @param {import("express").Request} req - Express request object.
   *   Expected body: { token, password, confirmPassword }
   * @param {import("express").Response} res - Express response object.
   */
  async resetPassword(req, res) {
    console.log("RESET BODY:", req.body);
    console.log("RESET TOKEN:", req.params.token);

    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Todos los campos son necesarios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    try {
      const user = await this.dao.model.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Token no válida o expirada" });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      await sendMail(
        user.email,
        "Contraseña exitosamente cambiada",
        `
        <h2>Hola ${user.firstName},</h2>
        <p>Tu contraseña ha sido exitosamente cambiada.</p>
        <p>Si no fuiste tú el que realizó esta acción, por favor contactanos.</p>
        <p>Saludos,<br/>Soporte de Lumo</p>
      `,
      );

      return res
        .status(200)
        .json({ message: "Password has been reset successfully" });
    } catch (err) {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages[0] });
      }

      console.error("Reset password error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Sends a password reset email with a unique token valid for 1 hour.
   *
   * @async
   * @param {import("express").Request} req - Express request object. Expected body: { email }
   * @param {import("express").Response} res - Express response object
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email es requerido" });
      }

      const user = await this.dao.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const frontendBase = 'https://lumo-front-jtug.vercel.app';
      const resetLink = `${frontendBase}/reset-password/?token=${encodeURIComponent(token)}`;

      await sendMail(
        user.email,
        "Recuperar contraseña",
        `
          <h2>Hola ${user.firstName || "usuario"},</h2>
          <p>A continuación tu petición de recuperar contraseña.</p>
          <p>Por favor haz clic al link abajo (válido por 1 hora):</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Si no fuiste tú el que solicitó esto, por favor ignora el correo.</p>
        `,
      );

      return res
        .status(200)
        .json({ message: "Email de recuperar contraseña enviado" });
    } catch (err) {
      console.error("Error recuperar contraseña:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

/**
 * Export a singleton instance of UserController.
 */
module.exports = new UserController();
