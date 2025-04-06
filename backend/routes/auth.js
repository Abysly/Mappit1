import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import upload from "../middleware/profileUpload.js"; // ⬅️ Multer config file
import path from "path";
import fs from "fs";

const router = express.Router();

// 🔹 User Signup (Without Auto-Login)
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0], // Returns user data without creating session
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 User Login (Creates a Session)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    req.session.user = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      is_admin: user.rows[0].is_admin,
      is_subscribed: user.rows[0].is_subscribed,
      profile_pic: user.rows[0].profile_pic, // ✅ This is the fix
    };
    res.json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get User Profile (Requires Session)
// Modify profile endpoint to handle both cases
router.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ authenticated: false }); // Changed from 401
  }
  res.status(200).json({
    authenticated: true,
    user: req.session.user,
  });
});

router.get("/status", (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({
      isAuthenticated: false,
      isAdmin: false,
      isSubscribed: false,
    });
  }
  console.log("Session user object:", req.session.user);

  res.status(200).json({
    isAuthenticated: true,
    isAdmin: req.session.user.is_admin,
    isSubscribed: req.session.user.is_subscribed,
    user: {
      id: req.session.user.id,
      name: req.session.user.name,
      email: req.session.user.email,
      profile_pic: req.session.user.profile_pic || null, // nested here
    },
  });
});

// 🔹 Logout (Destroy Session)
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// 🔹 Upload Profile Picture
router.post(
  "/upload/profile-pic",
  upload.single("profile_pic"),
  async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const newFileName = req.file.filename;
    const uploadDir = path.join(path.resolve(), "uploads");

    try {
      // Get old profile pic
      const { rows } = await pool.query(
        "SELECT profile_pic FROM users WHERE id = $1",
        [userId]
      );
      const oldPic = rows[0]?.profile_pic;

      // Update with new profile_pic filename
      await pool.query("UPDATE users SET profile_pic = $1 WHERE id = $2", [
        newFileName,
        userId,
      ]);
      req.session.user.profile_pic = newFileName;

      // Delete old file (if exists)
      if (oldPic) {
        const oldPath = path.join(uploadDir, oldPic);
        fs.unlink(oldPath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Error deleting old profile pic:", err);
          }
        });
      }

      res.status(200).json({
        message: "Profile picture uploaded",
        filename: newFileName,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export default router;
