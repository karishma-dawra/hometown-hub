const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// MongoDB post model
const postSchema = new mongoose.Schema({
  author: {
    type: String,
    default: "Hometown Hub Member",
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Hometown Hub backend is running!" });
});

// Get all posts from MongoDB
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(
      posts.map((post) => ({
        id: post._id.toString(),
        author: post.author,
        content: post.content,
        likes: post.likes,
        createdAt: post.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Could not fetch posts." });
  }
});

// Save a new post to MongoDB
app.post("/api/posts", async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content cannot be empty.",
      });
    }

    const post = await Post.create({
      author: author || "Hometown Hub Member",
      content: content.trim(),
    });

    res.status(201).json({
      id: post._id.toString(),
      author: post.author,
      content: post.content,
      likes: post.likes,
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Could not save post." });
  }
});
// Update and save a post's like count

// Like a post and save the count in MongoDB
app.patch("/api/posts/:id/like", async (req, res) => {
  try {
    // Reject invalid MongoDB IDs before querying the database
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    post.likes += 1;
    await post.save();

    res.json({
      id: post._id.toString(),
      likes: post.likes,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({
      message: "Could not update likes.",
    });
  }
});
// Start server only after MongoDB connects
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`Hometown Hub backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
