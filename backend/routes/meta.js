// routes/meta.js
import express from "express";
import pool from "../db.js";

console.log("✅ meta.js loaded");
const router = express.Router();
router.get("/test", (req, res) => {
  res.send("Meta route is working!");
});
console.log("✅ meta.js loaded");
// GET /api/categories
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM category ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/places
router.get("/places", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM places ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching places:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});
router.post("/events", async (req, res) => {
  // ✅ Ensure user is logged in
  if (!req.session?.user?.id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // ✅ Get organizer ID from session
  const organizer_id = req.session.user.id;

  const {
    title,
    description,
    category_id,
    place_id,
    venue,
    address,
    start_date,
    end_date,
    latitude,
    longitude,
    price,
    seats_available,
    target_audience,
    tags,
    youtube_link,
    is_public,
    allow_register,
    registration_link,
  } = req.body;

  try {
    const pgTagsArray = Array.isArray(tags) ? tags : null;

    const insertQuery = `
      INSERT INTO events (
        title, description, category_id, place_id, venue, address,
        start_date, end_date, latitude, longitude, price, seats_available,
        target_audience, tags, youtube_link, is_public, allow_register,
        registration_link, organizer_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19
      )
      RETURNING id
    `;

    const values = [
      title,
      description,
      category_id,
      place_id,
      venue,
      address,
      start_date,
      end_date,
      latitude,
      longitude,
      price,
      seats_available,
      target_audience,
      pgTagsArray,
      youtube_link,
      is_public,
      allow_register,
      registration_link,
      organizer_id, // ✅ Now securely from session
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("🔥 DB Error:", err);
    console.error("💥 Message:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events - Fetch all events with organizer's username, category, and place
router.get("/events", async (req, res) => {
  try {
    // SQL query to join events with users (organizer), categories, and places
    const result = await pool.query(
      `SELECT 
        e.id, e.title, e.description, e.start_date, e.end_date, e.venue, e.address, 
        e.latitude, e.longitude, e.price, e.seats_available, e.target_audience, 
        e.tags, e.youtube_link, e.is_public, e.allow_register, e.registration_link,e.is_approved, 
        u.name AS organizer_name,
        c.name AS category_name,
        p.name AS place_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN places p ON e.place_id = p.id
      ORDER BY e.created_at`
    );

    // Log the result to the console for debugging
    console.log("Fetched events:", result.rows);

    // Respond with the data as JSON
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/events/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE events SET is_approved = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event approved successfully", event: result.rows[0] });
  } catch (err) {
    console.error("Error approving event:", err);
    res.status(500).json({ error: "Failed to approve event" });
  }
});

router.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
