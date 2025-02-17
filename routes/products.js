const express = require("express");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Configure Multer for memory storage (images stored in RAM before processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Add a new product with an image
router.post("/", upload.single("image"), asyncHandler(async (req, res) => {
  try {
    let compressedImage = null;

    if (req.file) {
      // 🔥 Optimize & compress images (except SVG, which doesn't need compression)
      if (req.file.mimetype !== "image/svg+xml") {
        compressedImage = await sharp(req.file.buffer)
          .resize({ width: 500 }) // Resize width to 500px (maintains aspect ratio)
          .jpeg({ quality: 70 }) // Convert to JPEG (reduce size while keeping quality)
          .toBuffer();
      } else {
        compressedImage = req.file.buffer; // SVG doesn't need compression
      }
    }

    const newProduct = new Product({
      ...req.body,
      image: req.file
        ? { data: compressedImage, contentType: req.file.mimetype }
        : null,
    });

    await newProduct.save();
    res.json({ message: "✅ Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
}));

// ✅ Get a single product by ID (Return Image as Base64)
router.get("/product/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }

  if (product.image && product.image.data) {
    product.image = {
      data: product.image.data.toString("base64"), // Convert Buffer to Base64
      contentType: product.image.contentType,
    };
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

// ✅ Update a product
router.put("/:id", upload.single("image"), asyncHandler(async (req, res) => {
  try {
    let updatedFields = { ...req.body };

    if (req.file) {
      let compressedImage = req.file.buffer;
      if (req.file.mimetype !== "image/svg+xml") {
        compressedImage = await sharp(req.file.buffer)
          .resize({ width: 500 })
          .jpeg({ quality: 70 })
          .toBuffer();
      }

      updatedFields.image = {
        data: compressedImage,
        contentType: req.file.mimetype,
      };
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
