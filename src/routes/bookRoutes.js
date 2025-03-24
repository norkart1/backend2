import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    
    const { title, caption, image, rating } = req.body;

    if (!image || !title || !caption || !rating) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    }

    //upload image to cloudinary
    const updateResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save book to db

    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
