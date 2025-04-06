// routes/users.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

console.log("✅ users.js loaded");

// 🛡️ Middleware to restrict access to admins only
function requireAdmin(req, res, next) {
  if (!req.session?.user?.is_admin) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// ✅ GET /api/users — get list of all users
router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at, is_admin, is_subscribed, profile_pic
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ❌ DELETE /api/users/:id — delete a specific user
router.delete("/:id", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", deletedId: userId });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
