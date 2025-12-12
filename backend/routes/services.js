import express from "express";
import mongoose from "mongoose";

import {
  User,
  Attendance,
  Payroll,
  Leave,
  Grievance,
  Notice,
  Calendar
} from "../schema.js";

import moment from "moment";

const router = express.Router();


// USERS
router.get("/users", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { role: { $ne: "Owner" } };

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const data = await User.find(filter)
      .select("employeeId firstName lastName email department role isActive -_id")
      .lean();

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GRIEVANCE
router.get("/grievance", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const grievances = await Grievance.find(filter)
      .populate("userId", "employeeId -_id")
      .select("ticketId category description status isAnonymous createdAt userId adminNotes -_id")
      .lean();

    const cleanData = grievances.map(g => ({
      ticketId: g.ticketId,
      category: g.category,
      description: g.description,
      status: g.status,
      isAnonymous: g.isAnonymous ? 1 : 0,
      createdAt: g.createdAt,
      userEmployeeId: g.isAnonymous ? null : g.userId?.employeeId || null,
      adminNotes: g.adminNotes || null
    }));

    res.json({ success: true, count: cleanData.length, data: cleanData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATTENDANCE
// ATTENDANCE
router.get("/attendance", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      // date is stored as string YYYY-MM-DD
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const data = await Attendance.find(filter)
      .select("date clockIn clockOut status userId -_id")
      .populate({ path: "userId", select: "employeeId -_id" })
      .lean();

    const formatted = data.map(a => ({
      employeeId: a.userId?.employeeId || null,
      date: a.date, // already a string
      checkIn: a.clockIn ? moment(a.clockIn).format("HH:mm") : "--:--",
      checkOut: a.clockOut ? moment(a.clockOut).format("HH:mm") : "--:--",
      status: a.status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PAYROLL
router.get("/payroll", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      filter.$or = [
        { year: { $gt: sDate.getFullYear(), $lt: eDate.getFullYear() } },
        { year: sDate.getFullYear(), month: { $gte: sDate.getMonth() + 1 } },
        { year: eDate.getFullYear(), month: { $lte: eDate.getMonth() + 1 } },
      ];
    }

    const data = await Payroll.find(filter)
      .select("userId department month year financials status -_id")
      .populate({ path: "userId", select: "employeeId -_id" })
      .lean();

    const formatted = data.map(p => ({
      employeeId: p.userId?.employeeId || null,
      department: p.department,
      month: p.month,
      year: p.year,
      baseSalary: p.financials.baseSalary || 0,
      overtimeHours: p.financials.overtimeHours || 0,
      overtimePay: p.financials.overtimePay || 0,
      grossSalary: p.financials.grossSalary || 0,
      taxAmount: p.financials.taxAmount || 0,
      netSalary: p.financials.netSalary || 0,
      status: p.status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LEAVES
router.get("/leaves", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    // Apply interval filter only if both dates are provided
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const data = await Leave.find(filter)
      .select("date reason type -_id") // essential fields only
      .lean();

    // Map to formatted output
    const formatted = data.map(l => ({
      date: l.date,
      reason: l.reason,
      type: l.type
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ANNOUNCEMENTS / NOTICES
router.get("/announcements", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const data = await Notice.find(filter)
      .select("title content targetAudience createdAt -_id")
      .lean();

    const formatted = data.map(n => ({
      title: n.title,
      content: n.content,
      targetAudience: n.targetAudience,
      createdAt: n.createdAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CALENDAR ROUTER
router.get("/calendar", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      // filter using ISO Date for calendar
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const data = await Calendar.find(filter)
      .select("title description date startTime endTime userIds -_id")
      .populate({ path: "userIds", select: "employeeId -_id" })
      .lean();

    const formatted = data.map(c => ({
  title: c.title,
  description: c.description,
  date: moment(c.date).format("YYYY-MM-DD"),
  startTime: c.startTime,
  endTime: c.endTime,
  employeeIds: c.userIds.map(u => u.employeeId).join(", ")  // <-- join with commas
}));


    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
