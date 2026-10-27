const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0 && items.every((x) => x.trim()),
        message: "Add at least one ingredient."
      }
    },
    steps: {
      type: [String],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0 && items.every((x) => x.trim()),
        message: "Add at least one preparation step."
      }
    },
    cookingTime: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);