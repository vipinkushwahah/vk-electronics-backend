const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  title: String,
  bankname: String,
  bankOffer: { type: Number, default: 0 },
  images: [{
    data: Buffer, // 🔥 Store image in binary format
    contentType: String, // 🔥 Store image type (jpeg, png, svg)
  }],
  category: {
    type: String,
    enum: ["smartphone", "electronics", "home-appliance"],
    required: true,
  },
  textColor: { type: String, default: "#000000" },
  bgColor: { type: String, default: "#ffffff" },
});

module.exports = mongoose.model("Product", productSchema);
