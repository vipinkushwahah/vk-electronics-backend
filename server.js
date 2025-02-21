const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Load environment variables

const productRoutes = require("./routes/products"); // Import product routes
const reviewRoutes = require("./routes/reviews"); // Import review routes
const authRoutes = require("./routes/auth"); // Import authentication routes

// ✅ Secure MongoDB Connection
const mongoUri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`;

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.use("/products", productRoutes); // ✅ productRoutes handling
app.use("/reviews", reviewRoutes); // ✅ reviewRoutes handling
app.use("/auth", authRoutes); // Authentication routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
