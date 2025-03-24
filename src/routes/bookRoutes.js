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

// pagination => infinte loading

router.get("/", protectRoute, async (req, res) => {
  // const response = await fetch("https://635ec1c1-54b7-4fbc-b5f6-fe1048fc3b5d-00-d31bu5pb922l.pike.repl.co/api/books?page=1&limit=5");

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books routes");
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.delet("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(400).json({ message: "Book not found" });

    // check if user is the creator of the book

    if (book.user.toString() !== req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You are not authorised to delete this book" });

    // delete image form cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully " });
  } catch (error) {
    console.log("Error deleting book", erro);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
