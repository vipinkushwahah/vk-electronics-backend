// Add a new review
router.post("/", upload.array("images", 5), asyncHandler(async (req, res) => { // Max 5 images allowed
    try {
      const newReview = new Review({
        productId: req.body.productId,
        userId: req.body.userId,
        username: req.body.username, // Ensure username is sent from the frontend
        rating: req.body.rating,
        comment: req.body.comment,
      });
  
      // Process images if provided
      if (req.files) {
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
  