const express = require("express");
const bcrypt = require("bcryptjs"); // Use bcryptjs
const User = require("../models/User");
const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
      const { email, username, password, isShopkeeper } = req.body; // Add isShopkeeper
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "Email already exists!" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, username, password: hashedPassword, isShopkeeper });
      await user.save();
      res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Error creating user!" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        res.status(200).json({
            message: "Login successful!",
            userId: user._id,
            username: user.username || "User", // Default if username field is missing
            isShopkeeper: user.isShopkeeper,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Error during login!" });
    }
});

// Get all users (Admin feature)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "email isShopkeeper"); // Fetch only necessary fields
        res.json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ message: "Error fetching users!" });
    }
});

// Delete a user (Admin feature)
router.delete("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Error deleting user!" });
    }
});

// Password Reset Route
router.post("/reset-password", async (req, res) => {
  try {
      const { email, newPassword } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: "User not found!" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password reset successful!" });
  } catch (error) {
      console.error("Password Reset Error:", error);
      res.status(500).json({ message: "Error resetting password!" });
  }
});

module.exports = router;
