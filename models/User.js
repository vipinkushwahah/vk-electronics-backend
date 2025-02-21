const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isShopkeeper: { type: Boolean, default: false }, // Field to identify if user is a shopkeeper
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
