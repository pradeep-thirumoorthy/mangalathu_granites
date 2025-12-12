import express from "express";
import { User, Notice, Leave, } from "../schema.js";
const router = express.Router();
// === GET ALL EMPLOYEES ===
// GET /announcements?userId=...
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ message: "Missing userId" });

    // Get the user to know their department
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter: targetAudience = 'All' or matches user's department
    const announcements = await Notice.find({
      $or: [
        { targetAudience: "All" },
        { targetAudience: user.department } 
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
    res.status(200).json(announcements);

  } catch (error) {
    console.error("Fetch announcements error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notice.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    console.error("DELETE /announcements/:id error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
// UPDATE ANNOUNCEMENT
router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, targetAudience } = req.body;

    const updated = await Notice.findByIdAndUpdate(
      id,
      {
        title,
        content,
        targetAudience,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, announcement: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { title, content, targetAudience, createdBy } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const announcement = await Notice.create({
      title,
      content,
      targetAudience: targetAudience || "All",
      createdBy,
    });

    return res.status(201).json({ success: true, announcement });
  } catch (err) {
    console.error("POST /announcements error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/leaves/create", async (req, res) => {
  try {
    const { date, reason, type } = req.body;
    console.log(req.body)
    // Basic validation
    if ( !date || !reason) {

      return res.status(400).json({
        success: false,
        message: "date, and reason are required",
      });
    }

    // Optional: validate simple YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format, use YYYY-MM-DD",
      });
    }

    // If the user already applied for leave on same date, block it
    const existing = await Leave.findOne({ date });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Leave already exists for this date",
      });
    }

    const leave = await Leave.create({
      date,
      reason,
      type: type || "Leave",
    });

    return res.status(201).json({
      success: true,
      leave,
    });

  } catch (err) {
    console.error("POST /leaves/create error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/leaves", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Date range required" });
    }

    const leaves = await Leave.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    res.json(leaves);
  } catch (err) {
    console.error("GET /leaves error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.delete("/leaves/delete/:id", async (req, res) => {
  try {
    const removed = await Leave.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ success: false, message: "Leave not found" });

    res.json({ success: true, message: "Leave deleted" });
  } catch (err) {
    console.error("DELETE /leaves/delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
