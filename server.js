const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/products"); // Remove .js extension

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log(err));

app.use("/products", productRoutes);

app.listen(5001, () => console.log("🚀 Server running on port 5001"));
