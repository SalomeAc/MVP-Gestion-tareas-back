const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * User schema definition.
 *
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Los nombres son requeridos"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Los apellidos son requeridos"],
    trim: true,
  },
  age: {
    type: Number,
    min: [13, "El usuario debe tener al menos 13 años"],
    required: true,
  },
  email: {
    type: String,
    required: [true, "El correo es requerido"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Inserte un email válido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial",
    ],
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
});

/**
 * Hashes the password after validating all fields just before saving the document.
 */
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

/**
 * Hashes the password after validating all fields just before updating the document.
 */
UserSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc && doc.password && !doc.password.startsWith("$2b$")) {
    const hashed = await bcrypt.hash(doc.password, 10);
    await doc.updateOne({ password: hashed }, { runValidators: false });
  }
  next();
});

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents.
 */
module.exports = mongoose.model("User", UserSchema);
