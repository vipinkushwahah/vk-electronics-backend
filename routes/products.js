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
      for (let file of req.files) {
        let compressedImage = file.buffer;

        if (file.mimetype !== "image/svg+xml") {
          compressedImage = await sharp(file.buffer)
            .resize({ width: 500 }) // Resize width to 500px (maintains aspect ratio)
            .jpeg({ quality: 70 }) // Convert to JPEG (reduce size while keeping quality)
            .toBuffer();
        }

        compressedImages.push({
          data: compressedImage,
          contentType: file.mimetype,
        });
      }
    }

    // Create a new product with the compressed images
    const newProduct = new Product({
      ...req.body,
      images: compressedImages, 
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

  // // Convert images from binary (Buffer) to Base64
  // if (product.images && product.images.length > 0) {
  //   product.images = product.images.map((image) => ({
  //     data: `data:${image.contentType};base64,${image.data.toString("base64")}`, // ✅ Proper Base64 conversion
  //     contentType: image.contentType,
  //   }));
  // }

  // res.json(product);
}));

// ✅ Get all products (Ensure images are Base64)
router.get("/", asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();

    // Convert images from binary (Buffer) to Base64
    const formattedProducts = products.map(product => ({
      ...product._doc, // Ensure all product fields are included
      images: product.images.map(image => ({
        data: `data:${image.contentType};base64,${image.data.toString("base64")}`,
        contentType: image.contentType
      }))
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}));

// ✅ Get products by category (Ensure images are Base64)
router.get("/:category", asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });

    // Convert images from binary (Buffer) to Base64
    const formattedProducts = products.map(product => ({
      ...product._doc,
      images: product.images.map(image => ({
        data: `data:${image.contentType};base64,${image.data.toString("base64")}`,
        contentType: image.contentType
      }))
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("❌ Error fetching category products:", error);
    res.status(500).json({ message: "Failed to fetch category products" });
  }
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

      updatedFields.images = compressedImages;
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
