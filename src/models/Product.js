const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "O nome do produto é obrigatório"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A descrição do produto é obrigatória"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "O preço do produto é obrigatório"],
      min: [0, "O preço não pode ser negativo"],
    },
    category: {
      type: String,
      required: [true, "A categoria do produto é obrigatória"],
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
