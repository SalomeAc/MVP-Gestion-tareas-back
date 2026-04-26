const mongoose = require("mongoose");

const ALLOWED_TASK_STATUS = ["pendiente", "en curso", "finalizada"];

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
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    dueDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_TASK_STATUS,
        message: "El estado debe ser: pendiente, en curso o finalizada",
      },
      default: "pendiente",
      lowercase: true,
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
