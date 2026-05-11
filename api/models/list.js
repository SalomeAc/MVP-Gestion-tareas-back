const mongoose = require("mongoose");


const ListSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La lista debe estar asociada a un usuario"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("List", ListSchema);
