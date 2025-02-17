const express = require("express");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Configure Multer for memory storage (images stored in RAM before processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Add a new product with multiple images
router.post("/", upload.array("images", 5), asyncHandler(async (req, res) => { // Max 5 images allowed
  try {
    let compressedImages = [];

    if (req.files) {
      // 🔥 Optimize & compress images (except SVG, which doesn't need compression)
      for (let file of req.files) {
        let compressedImage = file.buffer;

        if (file.mimetype !== "image/svg+xml") {
          compressedImage = await sharp(file.buffer)
            .resize({ width: 500 }) // Resize width to 500px (maintains aspect ratio)
            .jpeg({ quality: 70 }) // Convert to JPEG (reduce size while keeping quality)
            .toBuffer();
        }

        // Push compressed image to array
        compressedImages.push({
          data: compressedImage,
          contentType: file.mimetype,
        });
      }
    }

    // Create a new product with the compressed images and other details
    const newProduct = new Product({
      ...req.body,
      images: compressedImages, // Store multiple images
    });

    await newProduct.save();
    res.json({ message: "✅ Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
}));

// ✅ Get a single product by ID (Return images as Base64)
router.get("/product/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }

  // Convert images from binary (Buffer) to Base64 for the frontend
  if (product.images && product.images.length > 0) {
    product.images = product.images.map((image) => ({
      data: image.data.toString("base64"), // Convert Buffer to Base64
      contentType: image.contentType,
    }));
  }

  res.json(product);
}));

// ✅ Get all products
router.get("/", asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
}));

// ✅ Get products by category
router.get("/:category", asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
}));

// ✅ Update a product (supporting multiple image updates)
router.put("/:id", upload.array("images", 5), asyncHandler(async (req, res) => {
  try {
    let updatedFields = { ...req.body };

    if (req.files && req.files.length > 0) {
      let compressedImages = [];
      for (let file of req.files) {
        let compressedImage = file.buffer;

        if (file.mimetype !== "image/svg+xml") {
          compressedImage = await sharp(file.buffer)
            .resize({ width: 500 })
            .jpeg({ quality: 70 })
            .toBuffer();
        }

        compressedImages.push({
          data: compressedImage,
          contentType: file.mimetype,
        });
      }

      updatedFields.images = compressedImages; // Update images field
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "❌ Product not found!" });
    }

    res.json({ message: "✅ Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
}));

// ✅ Delete a product
router.delete("/:id", asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }
  res.json({ message: "✅ Product deleted successfully!" });
}));

module.exports = router;
