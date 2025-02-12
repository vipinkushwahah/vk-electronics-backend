const express = require("express");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

const router = express.Router();

// **1️⃣ Get a single product by ID**
router.get("/product/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }
  res.json(product);
}));

// **2️⃣ Get all products**
router.get("/", asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
}));

// **3️⃣ Get products by category**
router.get("/:category", asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
}));

// **4️⃣ Add a new product**
router.post("/", asyncHandler(async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json({ message: "✅ Product added successfully!", product: newProduct });
}));

// **5️⃣ Update a product**
router.put("/:id", asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedProduct) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }
  res.json({ message: "✅ Product updated successfully!", product: updatedProduct });
}));

// **6️⃣ Delete a product**
router.delete("/:id", asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }
  res.json({ message: "✅ Product deleted successfully!" });
}));

module.exports = router;
