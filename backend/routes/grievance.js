import express from "express";
import {Grievance,User} from "../schema.js";

const router = express.Router();


// ----------------------------------------------------
// CREATE Grievance
// ----------------------------------------------------
router.post("/create", async (req, res) => {
  try {
    const { userId, isAnonymous, category, description } = req.body;

    const ticketId = "TKT-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const grievance = await Grievance.create({
      ticketId,
      userId:  userId,
      isAnonymous,
      category,
      description,
    });

    // ROUTING LOGIC
    let notifyHR = true;
    let notifySupervisor = false;

    if (category === "Other") notifySupervisor = true;

    // DOES NOT SEND TO SUPERVISOR IF ANONYMOUS
    if (isAnonymous) notifySupervisor = false;

    // SEND NOTIFICATIONS
    if (notifyHR) {
      console.log("→ HR notified about grievance " + ticketId);
      // Example: send email or push notification
    }

    if (notifySupervisor) {
      console.log("→ Supervisor notified about grievance " + ticketId);
    }

    return res.json({
      success: true,
      message: "Grievance submitted successfully",
      ticketId,
      routedTo: {
        hr: notifyHR,
        supervisor: notifySupervisor,
      },
    });

  } catch (err) {
    console.error("Grievance Create Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.get("/user/:id", async (req, res) => {
  try {
    const grievances = await Grievance.find({ userId: req.params.id }).sort({ createdAt: -1 });

    res.json({ success: true, data: grievances });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ----------------------------------------------------
// GET My Grievances
// ----------------------------------------------------
router.patch("/close/:id", async (req, res) => {
  try {
    const grievanceId = req.params.id;
    const { adminNotes, resolvedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(grievanceId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    if (!adminNotes || adminNotes.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Admin notes required to close ticket",
      });
    }

    const grievance = await Grievance.findById(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found",
      });
    }

    if (grievance.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Ticket already resolved",
      });
    }

    grievance.status = "Resolved";
    grievance.adminNotes = adminNotes;
    if (resolvedBy) grievance.resolvedBy = resolvedBy;
    grievance.resolvedAt = new Date();

    await grievance.save();

    return res.json({
      success: true,
      message: "Grievance resolved",
      data: grievance,
    });
  } catch (err) {
    console.error("Close Grievance Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GET ALL GRIEVANCES
// GET /grievance/all?role=...&userId=...
router.get("/all", async (req, res) => {
  try {
    const { role, userId } = req.query;

    if (!role || !userId) {
      return res.status(400).json({ success: false, message: "Missing role or userId" });
    }

    let filter = {};

    // Owner & HR: full access
    if (role.toLowerCase() === "owner" || role.toLowerCase() === "hr") {
      filter = {}; 
    }
    // Supervisor: only their department
    else if (role.toLowerCase().includes("supervisor")) {
      const supervisor = await User.findById(userId);
      if (!supervisor) {
        return res.status(404).json({ success: false, message: "Supervisor not found" });
      }

      // Filter grievances where the user's department matches supervisor's
      filter = { "user.department": supervisor.department }; 
    }

    // Regular employee: only their own grievances
    else {
      filter = { userId };
    }
    
    console.log(filter)
    // Use aggregation for efficient department-based filtering
    const grievances = await Grievance.aggregate([
      // Join user data
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      
      // Supervisor filter
      ...(role.toLowerCase().includes("supervisor")
        ? [{ $match: { "user.department": filter["user.department"] } }]
        : []),

      // Project only necessary fields
      {
        $project: {
          ticketId: 1,
          isAnonymous: 1,
          category: 1,
          description: 1,
          status: 1,
          adminNotes: 1,
          createdAt: 1,
          userId: "$user._id",
          userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          employeeId: "$user.employeeId",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.json({ success: true, data: grievances });
  } catch (err) {
    console.error("Grievance Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const { status, adminNotes, resolvedBy } = req.body;
    const { id } = req.params;

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Grievance not found" });
    }

    // Update status only if valid
    if (status) {
      if (!["Open", "In-Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      grievance.status = status;

      // If closing ticket then set resolvedBy
      if (status === "Resolved" && resolvedBy) {
        grievance.resolvedBy = resolvedBy;
      }
    }

    // Admin notes can be updated anytime
    if (adminNotes) {
      grievance.adminNotes = adminNotes;
    }

    await grievance.save();

    return res.json({
      success: true,
      message: "Grievance updated successfully",
      data: grievance
    });

  } catch (err) {
    console.error("Update Grievance Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
