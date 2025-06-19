const express = require("express");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Multer setup (store images in memory for processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Helper: Convert images to Base64 format
const formatImages = (images) => {
  return images.map((image) => ({
    data: `data:${image.contentType};base64,${image.data.toString("base64")}`,
    contentType: image.contentType,
  }));
};

// ✅ CREATE Product
router.post("/", upload.array("images", 5), asyncHandler(async (req, res) => {
  try {
    const { createdBy } = req.body;
    if (!createdBy) {
      return res.status(400).json({ message: "createdBy is required" });
    }

    let compressedImages = [];
    if (req.files) {
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
    }

    const newProduct = new Product({
      ...req.body,
      images: compressedImages,
      createdBy,
    });

    await newProduct.save();
    res.json({ message: "✅ Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
}));

// ✅ GET All Products (optionally filter by createdBy query param)
router.get("/", asyncHandler(async (req, res) => {
  try {
    const filter = req.query.createdBy ? { createdBy: req.query.createdBy } : {};
    const products = await Product.find(filter);

    const formatted = products.map((product) => ({
      ...product._doc,
      images: formatImages(product.images),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}));

// ✅ GET Single Product by ID
router.get("/product/:id", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }

  res.json({
    ...product._doc,
    images: formatImages(product.images),
  });
}));

// ✅ GET Products by Category
router.get("/:category", asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });

    const formatted = products.map((product) => ({
      ...product._doc,
      images: formatImages(product.images),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching category products:", error);
    res.status(500).json({ message: "Failed to fetch category products" });
  }
}));

// ✅ UPDATE Product
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

// ✅ DELETE Product
router.delete("/:id", asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "❌ Product not found!" });
  }
  res.json({ message: "✅ Product deleted successfully!" });
}));

module.exports = router;
