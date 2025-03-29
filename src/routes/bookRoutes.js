import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Create a new book
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, image, rating } = req.body;

        if (!image || !title || !caption || rating === undefined) {
            return res.status(400).json({ message: "Title, caption, image, and rating are required" });
        }

        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 0 and 5" });
        }

        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, { folder: "books" });
        const imageUrl = uploadResponse.secure_url;

        const newBook = new Book({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id, // Ensure `req.user._id` exists
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        console.error("❌ Error creating book:", error);
        res.status(500).json({ message: "Failed to create book", error: error.message });
    }
});

// ✅ Get books with pagination
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 5, 1);
        const skip = (page - 1) * limit;

        const [books, totalBooks] = await Promise.all([
            Book.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "username profileImage"),
            Book.countDocuments()
        ]);

        res.json({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
            hasMore: skip + books.length < totalBooks
        });
    } catch (error) {
        console.error("❌ Error fetching books:", error);
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

// ✅ Get user's books
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("user", "username profileImage");

        res.json(books);
    } catch (error) {
        console.error("❌ Error fetching user books:", error);
        res.status(500).json({ message: "Failed to fetch user books", error: error.message });
    }
});

// ✅ Delete a book
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (String(book.user) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to delete this book" });
        }

        // Delete image from Cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`books/${publicId}`);
            } catch (deleteError) {
                console.error("⚠️ Error deleting image from Cloudinary:", deleteError);
            }
        }

        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting book:", error);
        res.status(500).json({ message: "Failed to delete book", error: error.message });
    }
});

export default router;