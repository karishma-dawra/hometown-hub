const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./User");

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

const createToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);
    res.status(500).json({
      message: "Could not register user.",
    });
  }
});

// Log in an existing user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Could not log in.",
    });
  }
});

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
