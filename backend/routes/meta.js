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
// GET /api/events - Fetch all events with organizer's username, category, and place, excluding promoted
router.get("/events", async (req, res) => {
  try {
    const { is_approved } = req.query;

    let query = `
      SELECT 
        e.id, e.title, e.description, e.start_date, e.end_date, e.venue, e.address, 
        e.latitude, e.longitude, e.price, e.seats_available, e.target_audience, 
        e.tags, e.youtube_link, e.is_public, e.allow_register, e.registration_link, e.is_approved, 
        u.name AS organizer_name,
        c.name AS category_name,
        p.name AS place_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN places p ON e.place_id = p.id
      WHERE e.id NOT IN (SELECT event_id FROM promote_event)
    `;

    // Optional: filter by approval status
    if (is_approved !== undefined) {
      const approvedValue = is_approved === "false" ? false : true;
      query += ` AND e.is_approved = ${approvedValue}`;
    }

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch events", details: err.message });
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

// ✅ Add new category
router.post("/categories", async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ error: "Category name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO category (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Failed to add category" });
  }
});

// ✅ Delete category by ID
router.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM category WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res
      .status(200)
      .json({ message: "Category deleted", category: result.rows[0] });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// ✅ Add new place (venue)
router.post("/places", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Place name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO places (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding place:", err);
    res.status(500).json({ error: "Failed to add place" });
  }
});

// ✅ Delete place by ID
router.delete("/places/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM places WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.status(200).json({ message: "Place deleted", place: result.rows[0] });
  } catch (err) {
    console.error("Error deleting place:", err);
    res.status(500).json({ error: "Failed to delete place" });
  }
});

// ✅ GET /api/users/count
router.get("/users/count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM users");
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error counting users:", err);
    res.status(500).json({ error: "Failed to count users" });
  }
});
// ✅ GET /api/events/count
router.get("/events/count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM events");
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error counting events:", err);
    res.status(500).json({ error: "Failed to count events" });
  }
});
// ✅ GET /api/categories/count
router.get("/categories/count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM category");
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error counting categories:", err);
    res.status(500).json({ error: "Failed to count categories" });
  }
});
// ✅ GET /api/events/recent - Recent 5 events by created_at
router.get("/events/recent", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.title, 
        e.created_at, 
        u.name AS organizer, 
        CASE 
          WHEN e.is_approved THEN 'active' 
          ELSE 'pending' 
        END AS status
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recent events:", err);
    res.status(500).json({ error: "Failed to fetch recent events" });
  }
});

router.post("/promote", async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: "event_id is required" });
  }

  try {
    // Count current promotions
    const countRes = await pool.query("SELECT COUNT(*) FROM promote_event");
    const count = parseInt(countRes.rows[0].count);

    if (count >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum of 5 events can be promoted" });
    }

    // Get available IDs from 1–5
    const usedIdsRes = await pool.query(
      "SELECT id FROM promote_event ORDER BY id ASC"
    );
    const usedIds = usedIdsRes.rows.map((row) => row.id);
    const availableId = [1, 2, 3, 4, 5].find((id) => !usedIds.includes(id));

    // Insert promotion
    const insertRes = await pool.query(
      "INSERT INTO promote_event (id, event_id) VALUES ($1, $2) RETURNING *",
      [availableId, event_id]
    );

    res
      .status(201)
      .json({ message: "Event promoted", promotion: insertRes.rows[0] });
  } catch (err) {
    console.error("Error promoting event:", err);
    res.status(500).json({ error: "Failed to promote event" });
  }
});
router.get("/promote", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pe.id AS promote_id,
        e.id, e.title, e.description, e.start_date, e.end_date, e.venue, e.address, 
        e.latitude, e.longitude, e.price, e.seats_available, e.target_audience, 
        e.tags, e.youtube_link, e.is_public, e.allow_register, e.registration_link, e.is_approved,
        u.name AS organizer_name,
        c.name AS category_name,
        p.name AS place_name
      FROM promote_event pe
      JOIN events e ON pe.event_id = e.id
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN places p ON e.place_id = p.id
      ORDER BY pe.id
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching promoted events:", err);
    res.status(500).json({ error: "Failed to fetch promoted events" });
  }
});

router.delete("/promote/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM promote_event WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Promotion not found" });
    }

    res
      .status(200)
      .json({ message: "Promotion removed", promotion: result.rows[0] });
  } catch (err) {
    console.error("Error deleting promoted event:", err);
    res.status(500).json({ error: "Failed to delete promoted event" });
  }
});

export default router;
