// index.js
const dns = require('dns');
// Google DNS set karna taaki Atlas connection mein issue na aaye
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ================== CONFIG ==================
const PORT = 5000;
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.v4fsqcm.mongodb.net/?appName=Cluster0";
const JWT_SECRET = "7f9d3a8b6c1e2f4a9d8c7b5e3f1a6b9c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f1";

// ================== DB CONNECT ==================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================== SCHEMAS ==================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

// Item Schema
const itemSchema = new mongoose.Schema({
  itemName: String,
  description: String,
  type: { type: String, enum: ["Lost", "Found"] },
  location: String,
  date: String,
  contactInfo: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);

// ================== AUTH MIDDLEWARE ==================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token, Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================== AUTH ROUTES ==================

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User Registered Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ITEM ROUTES ==================

// ADD ITEM
app.post("/api/items", authMiddleware, async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      userId: req.user.id
    });

    await item.save();
    res.json(item);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ITEMS
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ITEM BY ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ITEM
app.put("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Only owner can update
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedItem);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ITEM
app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Only owner can delete
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH ITEM
app.get("/api/items/search", async (req, res) => {
  try {
    const { name } = req.query;

    const items = await Item.find({
      itemName: { $regex: name, $options: "i" }
    });

    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});