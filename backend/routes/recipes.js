const express = require("express");
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");

const router = express.Router();
const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

function cleanList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function parseRecipe(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const ingredients = cleanList(body.ingredients);
  const steps = cleanList(body.steps ?? body.preparationSteps);
  const cookingTime = Number(body.cookingTime ?? body.cookingTimeMinutes);

  if (!name) return { error: "Recipe name is required." };
  if (!categories.includes(category)) return { error: "Choose a valid recipe category." };
  if (!ingredients.length) return { error: "Enter at least one ingredient." };
  if (!steps.length) return { error: "Enter at least one preparation step." };
  if (!Number.isFinite(cookingTime) || cookingTime <= 0) return { error: "Cooking time must be a number greater than 0." };
  return { data: { name, category, ingredients, steps, cookingTime } };
}

router.get("/", async (_req, res, next) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID." });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = parseRecipe(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const recipe = await Recipe.create(parsed.data);
    res.status(201).json(recipe);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID." });
    const parsed = parseRecipe(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true, runValidators: true
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID." });
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json({ message: "Recipe deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;