import express from "express";
import mongoose from "mongoose";
import { Calendar, User } from "../schema.js"; // Assuming these are your Mongoose models
const router = express.Router();

// ------------------------------
// 1. Create a new calendar event
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const { userIds, date, startTime, endTime, title, description } = req.body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "userIds must be a non-empty array",
      });
    }
    if (!date || !startTime || !endTime || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Validate each ObjectId
    for (const id of userIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: `Invalid ObjectId: ${id}` });
      }
    }

    // Create new event
    const newEvent = await Calendar.create({
      userIds: userIds.map((id) => new mongoose.Types.ObjectId(id)), // Mongoose 7+ requires `new`
      date,
      startTime,
      endTime,
      title,
      description,
    });

    // Populate employee names
    const populatedEvent = await Calendar.findById(newEvent._id)
      .populate("userIds", "firstName lastName _id")
      .lean();

    res.status(201).json({ success: true, data: populatedEvent });
  } catch (err) {
    console.error("Error creating calendar event:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ------------------------------
// 2. Get calendar events (optionally filter by user)
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    let filter = {};

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: "Invalid userId" });
      }
      // Use $in to match array of userIds
      filter.userIds = { $in: [mongoose.Types.ObjectId(userId)] };
    }

    const events = await Calendar.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate("userIds", "firstName lastName") // Populate employee names
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ------------------------------
// 3. Update a calendar event
// ------------------------------
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }

    const { userIds, ...rest } = req.body;

    // Convert userIds to ObjectIds properly
    let updatedData = { ...rest };
    if (userIds && Array.isArray(userIds)) {
      updatedData.userIds = userIds.map((uid) => new mongoose.Types.ObjectId(uid));
    }

    const updatedEvent = await Calendar.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET worker schedules for a specific date
router.get("/user/:userId/:date", async (req, res) => {
  try {
    const { userId, date } = req.params;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or date",
      });
    }

    // Fetch schedules where the user is assigned
    const schedules = await Calendar.find({
      date: date,
      userIds: userId,
    }).populate("userIds", "firstName lastName department role");

    return res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });

  } catch (err) {
    console.error("Error fetching user schedules:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ------------------------------
// 4. Delete a calendar event
// ------------------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }

    const deletedEvent = await Calendar.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------
// 5. Fetch Warehouse employees (exclude Supervisor)
// ------------------------------
router.get("/workers/warehouse", async (req, res) => {
  try {
    const employees = await User.find({
      department: "Warehouse",
      role: { $ne: "Warehouse_Supervisor" },
    }).select("firstName lastName _id");

    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// ------------------------------
// VIEW schedules assigned to a specific employee
// ------------------------------
router.get("/view/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const filter = {
      userIds: userId, // employee must be inside userIds array
    };

    if (date) {
      filter.date = date; // exact date filter
    }

    const events = await Calendar.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate("userIds", "firstName lastName");

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Error fetching user view:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});


export default router;
