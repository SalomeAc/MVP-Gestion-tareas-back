const mongoose = require("mongoose");

const ALLOWED_TASK_STATUS = ["pendiente", "en progreso", "completada"];

/**
 * Task schema definition.
 *
 * Each task belongs to a single user and includes basic
 * lifecycle fields for MVP task tracking.
 */
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
      maxlength: [120, "El titulo no puede superar 120 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "La descripcion no puede superar 1000 caracteres"],
    },
    dueDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_TASK_STATUS,
        message: "El estado debe ser pendiente, en progreso o completada",
      },
      default: "pendiente",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La tarea debe estar asociada a un usuario"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", TaskSchema);
module.exports.ALLOWED_TASK_STATUS = ALLOWED_TASK_STATUS;
