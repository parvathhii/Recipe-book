require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const recipeRoutes = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://recipe-book-frontend-cmpu.onrender.com"
  ]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/recipes", recipeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server."
  });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Create backend/.env from backend/.env.example.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Recipe Book API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();