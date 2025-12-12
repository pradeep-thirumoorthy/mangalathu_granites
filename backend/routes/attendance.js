import express from "express";
import { User, Attendance, Calendar } from "../schema.js";
const router = express.Router();
import moment from "moment";
// === GET ALL EMPLOYEES ===
router.get("/attendanceLog", async (req, res) => {
  try {
    const { startDate, endDate, status, search, department } = req.query;
    console.log(req.query)
    // Step 1: Filter attendance dates & status
    const filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (status) filter.status = status;

    // Step 2: Restrict by department unless Office
    let allowedUserIds = [];
    if (department && department !== "Office") {
      allowedUserIds = await User.find({ department }).distinct("_id");
      filter.userId = { $in: allowedUserIds };
    }

    // Step 3: Apply search across employeeId / name
    if (search) {
      const regex = new RegExp(search, "i");
      const matchingUsers = await User.find({
        $or: [
          { employeeId: regex },
          { firstName: regex },
          { lastName: regex },
        ],
      }).distinct("_id");

      // Combine with department restriction if exists
      filter.userId = filter.userId
        ? { $in: filter.userId.$in.filter((id) => matchingUsers.includes(id)) }
        : { $in: matchingUsers };
    }
    console.log(filter)
    // Step 4: Query attendance
    const records = await Attendance.find(filter)
      .populate("userId", "firstName lastName employeeId department isActive")
      .sort({ date: -1 });
    //console.log(records)
    // Step 5: Format response
    const formatted = records.map((r) => {
      const u = r.userId;
      return {
        _id: r._id,
        userId: u?._id || null,
        employeeId: u?.employeeId || "Unknown",
        name: u ? `${u.firstName} ${u.lastName}` : "Unknown",
        department: u?.department || "Unknown",
        date: r.date,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
        overtimeHours: r.overtimeHours,
        status: r.status,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Attendance Log Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.post("/super/validate-scan", async (req, res) => {
  try {
    console.log("===== Validate Scan Request =====");
    console.log("Request body:", req.body);

    const { employeeId, type, date } = req.body;

    // Check for missing parameters
    if (!employeeId || !type) {
      console.log("❌ Missing parameters:", { employeeId, type });
      return res.status(400).json({ allowed: false, message: "Missing parameters" });
    }

    // Fetch employee
    const employee = await User.findById(employeeId);
    console.log("Fetched employee:", employee);

    if (!employee) {
      console.log("❌ Employee not found");
      return res.status(404).json({ allowed: false, message: "Employee not found" });
    }

    if (!employee.isActive) {
      console.log("❌ Employee inactive");
      return res.status(403).json({ allowed: false, message: "Employee inactive" });
    }

    const today = date || new Date().toISOString().slice(0, 10);
    console.log("Using date:", today);

    if (type === "IN") {
      console.log("✅ IN allowed for employee:", employeeId);
      return res.json({ allowed: true, message: "IN allowed" });
    }

    if (type === "OUT") {
      console.log("Checking if IN exists for today...");

      const attendanceRecord = await Attendance.findOne({
        userId: employeeId,
        date: today,
        clockIn: { $ne: null },
      });

      console.log("Attendance record found:", attendanceRecord);

      if (!attendanceRecord) {
        console.log("❌ Cannot clock out: no IN found for today");
        return res.json({
          allowed: false,
          message: "Cannot clock out: no IN found for today",
        });
      }

      console.log("✅ OUT allowed for employee:", employeeId);
      return res.json({ allowed: true, message: "OUT allowed" });
    }

    console.log("❌ Invalid type provided:", type);
    return res.json({ allowed: false, message: "Invalid type" });

  } catch (err) {
    console.error("🔥 Validate scan error:", err);
    return res.status(500).json({ allowed: false, message: "Server error" });
  }
});

router.post("/showroom/clockin", async (req, res) => {
  try {
    const { userId, supervisorId, timestamp } = req.body;
    console.log("IN request received:", { userId, supervisorId, timestamp });

    if (!userId || !supervisorId) {
      console.log("Missing parameters");
      return res.status(400).json({ success: false, message: "Missing userId or supervisorId" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      console.log("User not found or inactive:", userId);
      return res.status(404).json({ success: false, message: "User not found or inactive" });
    }

    const today = new Date().toISOString().slice(0, 10);
    console.log(today, "************************");

    // Check if IN already exists today
    const attendance = await Attendance.findOne({ userId, date: today });
    if (attendance) {
      return res.status(400).json({ 
        success: false, 
        message: "Clock-in already recorded for today" 
      });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      userId,
      supervisorId,
      date: today,
      clockIn: timestamp,
      clockOut: null,
      overtimeHours: 0,
      status: "Present",
    });

    await newAttendance.save();
    console.log("IN recorded:", newAttendance);

    return res.json({ success: true, message: "IN successful", attendance: newAttendance });
  } catch (err) {
    console.error("IN error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/warehouse/clockin", async (req, res) => {
  try {
    const { userId, supervisorId, scheduleId, date, time } = req.body;

    console.log("WAREHOUSE CLOCK-IN HIT:", req.body);

    // BASIC VALIDATION
    if (!userId || !supervisorId) {
      return res.status(400).json({
        success: false,
        message: "userId and supervisorId are required",
      });
    }

    // LOAD USER
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // BUILD DATE STRING
    const finalDate = date
      ? date
      : new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // BUILD TIME
    const finalTime = time ? time : new Date().toTimeString().slice(0, 5);

    // BUILD TIMESTAMP SAFELY
    let timestamp = new Date(`${finalDate}T${finalTime}:00`);
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date(); // fallback to valid date
    }

    // CHECK IF ATTENDANCE ALREADY EXISTS FOR THIS DATE
    let attendance = await Attendance.findOne({
      userId,
      date: finalDate,
    });

    // IF EXISTS → UPDATE CLOCK-IN
    if (attendance) {
      attendance.clockIn = timestamp;
      await attendance.save();

      console.log("WAREHOUSE CLOCK-IN UPDATED:", attendance);

      return res.json({
        success: true,
        message: "Clock-In updated",
        attendance,
      });
    }

    // IF NOT EXISTS → CREATE NEW ENTRY
    attendance = new Attendance({
      userId,
      supervisorId,
      date: finalDate,
      clockIn: timestamp,
      clockOut: null,
      overtimeHours: 0,
      status: "Present",
      scheduleId: scheduleId || null,
    });

    await attendance.save();

    console.log("WAREHOUSE CLOCK-IN CREATED:", attendance);

    return res.json({
      success: true,
      message: "Clock-In recorded",
      attendance,
    });

  } catch (err) {
    console.error("WAREHOUSE CLOCK-IN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});





router.post("/showroom/clockout", async (req, res) => {
  try {
    const { userId, supervisorId, reason } = req.body;

    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const today = moment().format("YYYY-MM-DD");

    let record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      return res.status(404).json({ message: "No IN record found" });
    }

    // Already clocked out?
    if (record.clockOut) {
      return res.status(400).json({ message: "Already clocked out" });
    }

    const now = new Date();
    const fourPM = moment(today + " 16:00", "YYYY-MM-DD HH:mm").toDate();

    let status = record.status;

    // Early leave logic
    if (now < fourPM) {
      if (!reason) {
        return res.status(400).json({ message: "Reason required for early leave" });
      }
      status = "Early Leave";
    }

    // Overtime logic
    const fivePM = moment(today + " 17:00", "YYYY-MM-DD HH:mm").toDate();
    let overtime = 0;

    if (now > fivePM) {
      const diffMs = now - fivePM;
      overtime = Math.floor(diffMs / (1000 * 60 * 60)); // hours only
    }

    // Update attendance
    record.clockOut = now;
    record.overtimeHours = overtime;
    record.status = status;
    if (reason) record.earlyLeaveReason = reason;

    await record.save();

    return res.json({
      message: "OUT recorded",
      record
    });

  } catch (err) {
    console.error("OUT error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/warehouse/clockout", async (req, res) => {
  try {
    const { userId, supervisorId, reason, overtimeHours = 0 } = req.body;

    if (!userId || !supervisorId) {
      return res.status(400).json({ message: "Missing userId or supervisorId" });
    }

    const today = moment().format("YYYY-MM-DD");

    // Find today's attendance
    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      return res.status(404).json({ message: "No clock-in record found for today" });
    }

    if (record.clockOut) {
      return res.status(400).json({ message: "Already clocked out" });
    }

    const now = new Date();
    const fourPM = moment(today + " 16:00", "YYYY-MM-DD HH:mm").toDate();

    let status = record.status;

    // Early leave logic
    if (now < fourPM) {
      if (!reason) {
        return res.status(400).json({ message: "Reason required for early leave" });
      }
      status = "Early Leave";
    }

    // Overtime logic (additional hours entered manually)
    record.clockOut = now;
    record.overtimeHours = overtimeHours || 0;
    record.status = status;
    record.earlyLeaveReason = reason || null;

    await record.save();

    return res.json({
      success: true,
      message: "Warehouse clock-out recorded",
      record
    });

  } catch (err) {
    console.error("WAREHOUSE CLOCK-OUT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.patch("/hr/attendanceEdit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clockIn, clockOut, status, overtimeHours } = req.body;

    const record = await Attendance.findById(id).populate("userId");

    if (!record) return res.status(404).json({ error: "Record Not Found" });

    // Update fields
    if (clockIn) record.clockIn = new Date(`${record.date}T${clockIn}:00`);
    if (clockOut) record.clockOut = new Date(`${record.date}T${clockOut}:00`);
    if (status) record.status = status;
    if (overtimeHours !== undefined) record.overtimeHours = overtimeHours;

    await record.save();

    res.json({
      message: "Attendance updated successfully",
      record: {
        _id: record._id,
        userId: record.userId?._id,
        employeeId: record.userId?.employeeId,
        name: `${record.userId?.firstName} ${record.userId?.lastName}`,
        date: record.date,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        overtimeHours: record.overtimeHours,
        status: record.status,
      },
    });
  } catch (err) {
    console.error("Attendance Edit Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});




// GET /att/employee/:userId?month=&year=
router.get("/employee/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const month = Number(req.query.month); // 1-12
    const year = Number(req.query.year);

    if (!userId || !month || !year) {
      return res.status(400).json({ success: false, message: "Missing userId, month, or year" });
    }

    // Format month as 2 digits
    const monthStr = month.toString().padStart(2, "0");
    const prefix = `${year}-${monthStr}`; // e.g., "2025-11"

    // Filter attendance where date string starts with YYYY-MM
    const attendance = await Attendance.find({
      userId,
      date: { $regex: `^${prefix}` } 
    }).sort({ date: 1 }); // Keep as string, no lean()

    res.json({ success: true, data: attendance });
  } catch (err) {
    console.error("GET /att/employee/:userId error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




export default router;
