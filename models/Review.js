const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ // Update to store multiple images
    data: Buffer,
    contentType: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
