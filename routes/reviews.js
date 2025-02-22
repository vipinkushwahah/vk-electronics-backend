const express = require("express");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const Review = require("../models/Review");

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add a new review with optional images
router.post("/", upload.array("images", 5), asyncHandler(async (req, res) => {
  try {
    const newReview = new Review({
      productId: req.body.productId,
      userId: req.body.userId,
      username: req.body.username, // Ensure username is sent from the frontend
      rating: req.body.rating,
      comment: req.body.comment,
    });

    // Process images if provided
    if (req.files && req.files.length > 0) {
      const compressedImages = await Promise.all(req.files.map(async (file) => {
        const compressedImage = await sharp(file.buffer)
          .resize({ width: 500 }) // Resize width to 500px
          .jpeg({ quality: 70 }) // Convert to JPEG
          .toBuffer();

        return {
          data: compressedImage,
          contentType: file.mimetype,
        };
      }));
      newReview.images = compressedImages; // Save multiple images
    }

    await newReview.save();
    res.json({ message: "✅ Review added successfully!", review: newReview });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
}));

// Get reviews by product ID
router.get("/", asyncHandler(async (req, res) => {
  try {
    const reviews = await Review.find();
    
    // Convert image buffer to Base64 for frontend display
    const formattedReviews = reviews.map(review => ({
      ...review._doc,
      images: review.images.map(img => ({
        data: `data:${img.contentType};base64,${img.data.toString("base64")}`,
        contentType: img.contentType,
      }))
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
}));

// Delete a review by ID
router.delete("/:id", asyncHandler(async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "❌ Review not found!" });
    }
    res.json({ message: "✅ Review deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
}));

module.exports = router;
