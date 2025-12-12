import express from "express";
import { User, Attendance, Payroll,Leave, Grievance, Notice, } from "../schema.js";
const router = express.Router();
import mongoose from "mongoose";
// === GET ALL EMPLOYEES ===


router.get("/summary", async (req, res) => {
  try {
    // ------------------------------
    // 1) Total active employees & by department
    // ------------------------------
    const totalEmployees = await User.countDocuments({
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    });

    const employeesByDept = await User.aggregate([
      {
        $match: { $or: [{ isActive: true }, { isActive: { $exists: false } }] }
      },
      {
        $group: {
          _id: { $ifNull: ["$department", "Unknown"] },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          count: 1
        }
      }
    ]);

    // ------------------------------
    // 2) Attendance trend — last 14 days
    // ------------------------------
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13); // last 14 days

    const startStr = start.toISOString().slice(0, 10); // YYYY-MM-DD

    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startStr } } },
      {
        $group: {
          _id: "$date",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates
    const attendanceTrendMap = {};
    attendanceAgg.forEach(a => {
      attendanceTrendMap[a._id] = { date: a._id, present: a.present, total: a.total };
    });

    const attendanceTrend = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceTrend.push(attendanceTrendMap[key] || { date: key, present: 0, total: 0 });
    }

    const avgAttendance =
      +(attendanceTrend.reduce((acc, t) => acc + (t.total === 0 ? 0 : (t.present / t.total) * 100), 0) /
      (attendanceTrend.length || 1)).toFixed(2);

    // ------------------------------
    // 3) Payroll: this month total & last 6 months
    // ------------------------------
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const payrollThisMonthAgg = await Payroll.aggregate([
      { $match: { month: thisMonth, year: thisYear } },
      { $group: { _id: null, totalPaid: { $sum: "$financials.netSalary" } } }
    ]);

    const payrollThisMonthTotal = payrollThisMonthAgg[0]?.totalPaid || 0;

    // last 6 months
    const months = [];
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - m, 1);
      months.push({ month: dt.getMonth() + 1, year: dt.getFullYear() });
    }

    const payrollChartAgg = await Payroll.aggregate([
      { $match: { $or: months.map(mm => ({ month: mm.month, year: mm.year })) } },
      { $group: { _id: { month: "$month", year: "$year" }, total: { $sum: "$financials.netSalary" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const payrollChartMap = {};
    payrollChartAgg.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2, "0")}`;
      payrollChartMap[key] = { month: p._id.month, year: p._id.year, total: p.total };
    });

    const payrollChart = months.map(mm => {
      const key = `${mm.year}-${String(mm.month).padStart(2, "0")}`;
      return payrollChartMap[key] || { month: mm.month, year: mm.year, total: 0 };
    }).map(p => ({ month: `${p.year}-${String(p.month).padStart(2, "0")}`, total: p.total }));

    // ------------------------------
    // 4) Grievances by status + recent
    // ------------------------------
    const grievancesByStatusAgg = await Grievance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const grievancesByStatus = grievancesByStatusAgg.reduce((acc, g) => {
      acc[g._id] = g.count;
      return acc;
    }, {});

    const recentGrievances = await Grievance.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("userId", "firstName lastName employeeId");

    // ------------------------------
    // 5) Recent Notices
    // ------------------------------
    const recentNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(6)
    // ------------------------------
    // Send JSON
    // ------------------------------
    res.json({
      totalEmployees:totalEmployees-4,
      employeesByDept,
      attendanceTrend,
      avgAttendance,
      payrollThisMonthTotal,
      payrollChart,
      grievancesByStatus,
      recentGrievances,
      recentNotices
    });

  } catch (err) {
    console.error("HR summary error:", err);
    res.status(500).json({ message: "Failed to fetch HR summary", error: err.message });
  }
});

router.get("/summary/:supervisorId", async (req, res) => {
  try {
    const { supervisorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return res.status(400).json({ message: "Invalid supervisorId" });
    }

    const supId = new mongoose.Types.ObjectId(supervisorId);

    // 1) Supervisor => department
    const supervisor = await User.findById(supId).select("department");
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const department = supervisor.department;

    // 2) Team (active)
    const team = await User.find({ department, isActive: true }).select(
      "_id firstName lastName employeeId role"
    );

    const teamIds = team.map(t => t._id);
    const teamCount = team.length;

    // 2.1) Build Team by Role
    const roleMap = {};
    team.forEach(member => {
      const role = member.role || "Unassigned";
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    const teamByRole = Object.entries(roleMap).map(([role, count]) => ({
      role,
      count
    }));

    // 3) Today's attendance
    const today = new Date().toISOString().slice(0, 10);

    const attendanceToday = await Attendance.aggregate([
      { $match: { userId: { $in: teamIds }, date: today } },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    const present = attendanceToday[0]?.present || 0;
    const totalToday = attendanceToday[0]?.total || teamCount;
    const absent = totalToday - present;

    // 4) 30-day attendance summary
    const end = new Date();
    const start30 = new Date();
    start30.setDate(end.getDate() - 29);

    const start30Str = start30.toISOString().slice(0, 10);

    const last30DaysAgg = await Attendance.aggregate([
      {
        $match: {
          userId: { $in: teamIds },
          date: { $gte: start30Str }
        }
      },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    const last30_present = last30DaysAgg[0]?.present || 0;
    const last30_total = last30DaysAgg[0]?.total || teamCount * 30;

    const attendancePerformance = {
      daysPresent: last30_present,
      daysAbsent: last30_total - last30_present,
      attendancePercentage:
        last30_total > 0
          ? Number(((last30_present / last30_total) * 100).toFixed(2))
          : 0
    };

    // 5) Attendance trend (14 days)
    const startTrend = new Date();
    startTrend.setDate(end.getDate() - 13);

    const trendStartStr = startTrend.toISOString().slice(0, 10);

    const attendanceTrendAgg = await Attendance.aggregate([
      {
        $match: {
          userId: { $in: teamIds },
          date: { $gte: trendStartStr }
        }
      },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trendMap = {};
    attendanceTrendAgg.forEach(a => {
      trendMap[a._id] = {
        date: a._id,
        present: a.present,
        total: a.total
      };
    });

    const attendanceTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startTrend);
      d.setDate(startTrend.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceTrend.push(
        trendMap[key] || { date: key, present: 0, total: 0 }
      );
    }

    // 6) Pending tasks
    const pendingGrievancesCount = await Grievance.countDocuments({
      userId: { $in: teamIds },
      status: "Open"
    });

    const pendingAttendanceIssues = await Attendance.countDocuments({
      userId: { $in: teamIds },
      status: { $in: ["Late", "Half Day", "Permission"] }
    });

    const pendingApprovals = {
      grievances: pendingGrievancesCount,
      attendanceIssues: pendingAttendanceIssues
    };

    // 7) Recent attendance logs
    const recentAttendance = await Attendance.find({
      userId: { $in: teamIds }
    })
      .sort({ date: -1 })
      .limit(6)
      .populate("userId", "firstName lastName employeeId");

    // 8) Recent grievances
    const recentGrievances = await Grievance.find({
      userId: { $in: teamIds }
    })
      .sort({ createdAt: -1 })
      .limit(6);

    // Final output
    res.json({
      teamCount,
      teamActive: teamCount,
      teamAttendanceToday: { present, absent },
      teamByRole,                      // <-- ADDED HERE
      attendancePerformance,
      attendanceTrend,
      pendingApprovals,
      recentAttendance,
      recentGrievances
    });

  } catch (err) {
    console.error("Supervisor Summary Error:", err);
    res.status(500).json({
      message: "Failed to fetch supervisor summary",
      error: err.message
    });
  }
});

router.get("/summary/salesExe/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Compute month range
    const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    // Attendance logs for month
    const attendance = await Attendance.find({
      userId: id,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    // Payroll for the month
    const payroll = await Payroll.findOne({
      userId: id,
      month,
      year
    }).lean();

    // HR-announced leaves (for the month)
    const leaves = await Leave.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();

    // Notices (all + department)
    const notices = await Notice.find({
      $or: [
        { targetAudience: "All" },
        { targetAudience: user.department }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Grievances for user
    const grievances = await Grievance.find({ userId: id })
  .sort({ createdAt: -1 })
  .populate("userId", "firstName lastName employeeId department role email") // Select the fields you need
  .lean();


    res.json({
      success: true,
      data: { user, attendance, payroll, leaves, notices, grievances }
    });
  } catch (err) {
    console.error("GET /dashboard/summary/salesExe error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/summary/wageWorker/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const attendance = await Attendance.find({
      userId: id,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const payroll = await Payroll.findOne({
      userId: id,
      month,
      year
    }).lean();

    const leaves = await Leave.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();

    const notices = await Notice.find({
      $or: [
        { targetAudience: "All" },
        { targetAudience: user.department }
      ]
    }).sort({ createdAt: -1 }).lean();

    const grievances = await Grievance.find({ userId: id }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: { user, attendance, payroll, leaves, notices, grievances }
    });
  } catch (err) {
    console.error("GET /dashboard/summary/wageWorker error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/owner", async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    // 1) Total & Active Employees
    const totalEmployees = await User.countDocuments({});
    const activeEmployees = await User.countDocuments({ isActive: true });

    const employeesByDept = await User.aggregate([
      { $group: { _id: { $ifNull: ["$department", "Unknown"] }, count: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", count: 1 } }
    ]);

    // 2) Payroll Metrics
    const payrollThisMonth = await Payroll.aggregate([
      { $match: { month: thisMonth, year: thisYear } },
      { $group: { _id: null, total: { $sum: "$financials.netSalary" } } }
    ]);

    const payrollPending = await Payroll.countDocuments({ "financials.netSalary": { $exists: false } });

    // Last 6 months payroll chart
    const months = [];
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - m, 1);
      months.push({ month: dt.getMonth() + 1, year: dt.getFullYear() });
    }

    const payrollChartAgg = await Payroll.aggregate([
      { $match: { $or: months.map(mm => ({ month: mm.month, year: mm.year })) } },
      { $group: { _id: { month: "$month", year: "$year" }, total: { $sum: "$financials.netSalary" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const payrollChartMap = {};
    payrollChartAgg.forEach(p => {
      payrollChartMap[`${p._id.year}-${p._id.month}`] = p.total;
    });

    const payrollChart = months.map(mm => ({
      month: `${mm.year}-${String(mm.month).padStart(2, "0")}`,
      total: payrollChartMap[`${mm.year}-${mm.month}`] || 0
    }));

    // 3) Attendance Today
    const todayStr = now.toISOString().slice(0,10);
    const attendanceTodayAgg = await Attendance.aggregate([
      { $match: { date: todayStr } },
      { $group: { _id: null, present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }, total: { $sum: 1 } } }
    ]);

    const attendanceToday = attendanceTodayAgg[0] || { present: 0, total: 0 };
    const absentToday = attendanceToday.total - attendanceToday.present;

    // 14-day attendance trend
    const startTrend = new Date();
    startTrend.setDate(now.getDate() - 13);
    const startStr = startTrend.toISOString().slice(0,10);

    const attendanceTrendAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startStr, $lte: todayStr } } },
      { $group: { _id: "$date", present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const trendMap = {};
    attendanceTrendAgg.forEach(a => { trendMap[a._id] = { present: a.present, total: a.total }; });

    const attendanceTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startTrend);
      d.setDate(startTrend.getDate() + i);
      const key = d.toISOString().slice(0,10);
      attendanceTrend.push({ date: key, ...trendMap[key] || { present: 0, total: 0 } });
    }

    // 4) Grievances & Notices
    const grievancesByStatusAgg = await Grievance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const grievancesByStatus = {};
    grievancesByStatusAgg.forEach(g => { grievancesByStatus[g._id] = g.count; });

    const recentGrievances = await Grievance.find().sort({ createdAt: -1 }).limit(6);
    const recentNotices = await Notice.find().sort({ createdAt: -1 }).limit(6);

    // 5) Department Performance
    const revenueByDeptAgg = await Payroll.aggregate([
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $group: { _id: "$user.department", revenue: { $sum: "$financials.netSalary" }, avgSalary: { $avg: "$financials.netSalary" }, count: { $sum: 1 } } },
    ]);
    const departmentPerformance = revenueByDeptAgg.map(r => ({ department: r._id || "Unknown", revenue: r.revenue, avgSalary: r.avgSalary, employees: r.count }));

    res.json({
      totalEmployees,
      activeEmployees,
      employeesByDept,
      payrollThisMonth: payrollThisMonth[0]?.total || 0,
      payrollPending,
      payrollChart,
      attendanceToday: { present: attendanceToday.present, absent: absentToday },
      attendanceTrend,
      grievancesByStatus,
      recentGrievances,
      recentNotices,
      departmentPerformance
    });

  } catch(err) {
    console.error("Owner dashboard error:", err);
    res.status(500).json({ message: "Failed to fetch owner dashboard", error: err.message });
  }
});


// ------------------- OWNER ANALYTICS -------------------
router.get("/analytics", async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    // 1) Total employees & active
    const totalEmployees = await User.countDocuments({});
    const activeEmployees = await User.countDocuments({ isActive: true });

    // 2) Employees by department
    const employeesByDeptAgg = await User.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const employeesByDept = employeesByDeptAgg.map(d => ({
      department: d._id || "Unknown",
      employees: d.count
    }));

    // 3) Attendance Trend (last 14 days)
    const startTrend = new Date();
    startTrend.setDate(now.getDate() - 13);
    const startStr = startTrend.toISOString().slice(0, 10);

    const attendanceTrendAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startStr } } },
      { $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const trendMap = {};
    attendanceTrendAgg.forEach(a => trendMap[a._id] = { date: a._id, present: a.present, total: a.total });

    const attendanceTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startTrend);
      d.setDate(startTrend.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceTrend.push(trendMap[key] || { date: key, present: 0, total: 0 });
    }

    // Today's attendance
    const todayStr = now.toISOString().slice(0, 10);
    const todayAttendanceAgg = await Attendance.aggregate([
      { $match: { date: todayStr } },
      { $group: { _id: null, present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }, total: { $sum: 1 } } }
    ]);
    const attendanceToday = {
      present: todayAttendanceAgg[0]?.present || 0,
      absent: (todayAttendanceAgg[0]?.total || 0) - (todayAttendanceAgg[0]?.present || 0)
    };

    // 4) Payroll summary this month
    const payrollThisMonthAgg = await Payroll.aggregate([
      { $match: { month: thisMonth, year: thisYear } },
      { $group: { _id: null, totalPaid: { $sum: "$financials.netSalary" } } }
    ]);
    const payrollThisMonth = payrollThisMonthAgg[0]?.totalPaid || 0;

    // 5) Payroll trend last 6 months
    const months = [];
    for (let m = 5; m >= 0; m--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - m, 1);
      months.push({ month: dt.getMonth() + 1, year: dt.getFullYear() });
    }
    const payrollTrendAgg = await Payroll.aggregate([
      { $match: { $or: months.map(mm => ({ month: mm.month, year: mm.year })) } },
      { $group: { _id: { month: "$month", year: "$year" }, total: { $sum: "$financials.netSalary" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const payrollTrendMap = {};
    payrollTrendAgg.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2, "0")}`;
      payrollTrendMap[key] = { month: p._id.month, year: p._id.year, total: p.total };
    });
    const payrollChart = months.map(mm => {
      const key = `${mm.year}-${String(mm.month).padStart(2, "0")}`;
      return payrollTrendMap[key] || { month: mm.month, year: mm.year, total: 0 };
    }).map(p => ({ month: `${p.year}-${String(p.month).padStart(2, "0")}`, total: p.total }));

    // 6) Department performance (avg salary, total revenue)
    const deptPerformanceAgg = await User.aggregate([
      { $group: {
        _id: "$department",
        employees: { $sum: 1 },
        avgSalary: { $avg: "$baseSalary" }
      }}
    ]);
    const departmentPerformance = deptPerformanceAgg.map(d => ({
      department: d._id || "Unknown",
      employees: d.employees,
      avgSalary: d.avgSalary || 0,
      revenue: Math.floor((d.avgSalary || 0) * (d.employees || 0))
    }));

    // 7) Grievances by status & recent 6
    const grievancesByStatusAgg = await Grievance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const grievancesByStatus = {};
    grievancesByStatusAgg.forEach(g => grievancesByStatus[g._id] = g.count);

    const recentGrievances = await Grievance.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("userId", "firstName lastName employeeId role");

    // 8) Recent Notices
    const recentNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // --- Return analytics JSON ---
    res.json({
      totalEmployees,
      activeEmployees,
      employeesByDept,
      attendanceTrend,
      attendanceToday,
      payrollThisMonth,
      payrollChart,
      departmentPerformance,
      grievancesByStatus,
      recentGrievances,
      recentNotices
    });

  } catch (err) {
    console.error("Owner analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
});

const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return months;
};

router.get("/analytics1", async (req, res) => {
  try {
    // 1) Attendance Trend (last 14 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13);
    const startStr = start.toISOString().slice(0, 10);

    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startStr } } },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const attendanceMap = {};
    attendanceAgg.forEach(a => {
      attendanceMap[a._id] = { date: a._id, present: a.present, total: a.total };
    });

    const attendanceTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceTrend.push(attendanceMap[key] || { date: key, present: 0, total: 0 });
    }

    // 2) Payroll Trend (last 6 months)
    const last6Months = getLastNMonths(6);

    const payrollAgg = await Payroll.aggregate([
      { $match: { $or: last6Months.map(m => ({ month: m.month, year: m.year })) } },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalNet: { $sum: "$financials.netSalary" },
          totalGross: { $sum: "$financials.grossSalary" },
          totalOvertime: { $sum: "$financials.overtimePay" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const payrollMap = {};
    payrollAgg.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2, "0")}`;
      payrollMap[key] = {
        month: p._id.month,
        year: p._id.year,
        totalNet: p.totalNet,
        totalGross: p.totalGross,
        totalOvertime: p.totalOvertime
      };
    });

    const payrollTrend = last6Months.map(m => {
      const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
      return payrollMap[key] || { month: m.month, year: m.year, totalNet: 0, totalGross: 0, totalOvertime: 0 };
    }).map(p => ({
      month: `${p.year}-${String(p.month).padStart(2, "0")}`,
      totalNet: p.totalNet,
      totalGross: p.totalGross,
      totalOvertime: p.totalOvertime
    }));

    // 3) Department-wise Employee Count
    const deptAgg = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $ifNull: ["$department", "Unknown"] },
          employees: { $sum: 1 }
        }
      }
    ]);

    const departmentPerformance = deptAgg.map(d => ({
      department: d._id,
      employees: d.employees
    }));

    // 4) Grievances by status (trend)
    const grievanceAgg = await Grievance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const grievancesByStatus = {};
    grievanceAgg.forEach(g => {
      grievancesByStatus[g._id] = g.count;
    });

    // 5) Overtime Hours Distribution (Wage Workers)
    const overtimeAgg = await Payroll.aggregate([
      { $match: { "financials.overtimeHours": { $gt: 0 } } },
      {
        $group: {
          _id: "$financials.overtimeHours",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const overtimeDistribution = overtimeAgg.map(o => ({
      overtimeHours: o._id,
      count: o.count
    }));

    // Send response
    res.json({
      attendanceTrend,
      payrollTrend,
      departmentPerformance,
      grievancesByStatus,
      overtimeDistribution
    });
  } catch (err) {
    console.error("Analytics /analytics1 error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics", error: err.message });
  }
});


// Utility: get last N weeks (for grievances)
const getLastNWeeks = (n) => {
  const weeks = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(now.getDate() - (i * 7 + 6));
    const end = new Date();
    end.setDate(now.getDate() - i * 7);
    weeks.push({ start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10) });
  }
  return weeks;
};

router.get("/analytics2", async (req, res) => {
  try {
    // 1) Attendance Trend (last 14 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 13);
    const startStr = start.toISOString().slice(0, 10);

    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startStr } } },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $ne: ["$status", "Present"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const attendanceMap = {};
    attendanceAgg.forEach(a => {
      attendanceMap[a._id] = { date: a._id, present: a.present, absent: a.absent };
    });

    const attendanceTrend = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      attendanceTrend.push(attendanceMap[key] || { date: key, present: 0, absent: 0 });
    }

    // 2) Payroll Trend (last 12 months)
    const last12Months = getLastNMonths(12);

    const payrollAgg = await Payroll.aggregate([
      { $match: { $or: last12Months.map(m => ({ month: m.month, year: m.year })) } },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          netSalary: { $sum: "$financials.netSalary" },
          grossSalary: { $sum: "$financials.grossSalary" },
          overtimePay: { $sum: "$financials.overtimePay" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const payrollMap = {};
    payrollAgg.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2, "0")}`;
      payrollMap[key] = {
        month: p._id.month,
        year: p._id.year,
        netSalary: p.netSalary,
        grossSalary: p.grossSalary,
        overtimePay: p.overtimePay
      };
    });

    const payrollTrend = last12Months.map(m => {
      const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
      return payrollMap[key] || { month: m.month, year: m.year, netSalary: 0, grossSalary: 0, overtimePay: 0 };
    }).map(p => ({
      month: `${p.year}-${String(p.month).padStart(2, "0")}`,
      netSalary: p.netSalary,
      grossSalary: p.grossSalary,
      overtimePay: p.overtimePay
    }));

    // 3) Department-wise Payroll Trend (stacked per department)
    const deptPayrollAgg = await Payroll.aggregate([
      {
        $group: {
          _id: { department: "$department", month: "$month", year: "$year" },
          netSalary: { $sum: "$financials.netSalary" },
          grossSalary: { $sum: "$financials.grossSalary" },
          overtimePay: { $sum: "$financials.overtimePay" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const departmentPayrollTrend = {};
    deptPayrollAgg.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2,"0")}`;
      if (!departmentPayrollTrend[key]) departmentPayrollTrend[key] = {};
      departmentPayrollTrend[key][p._id.department] = {
        netSalary: p.netSalary,
        grossSalary: p.grossSalary,
        overtimePay: p.overtimePay
      };
    });

    // 4) Grievance trend (last 8 weeks)
    const last8Weeks = getLastNWeeks(8);
    const grievances = await Grievance.find().lean();

    const grievanceTrend = last8Weeks.map(week => {
      const counts = { Open:0, "In-Progress":0, Resolved:0 };
      grievances.forEach(g => {
        const created = new Date(g.createdAt);
        if (created >= new Date(week.start) && created <= new Date(week.end)) {
          counts[g.status] = (counts[g.status] || 0) + 1;
        }
      });
      return { week: `${week.start} ~ ${week.end}`, ...counts };
    });

    // 5) Overtime Distribution (Wage Workers)
    const overtimeAgg = await Payroll.aggregate([
      { $match: { "financials.overtimeHours": { $gt: 0 } } },
      {
        $group: {
          _id: "$financials.overtimeHours",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const overtimeDistribution = overtimeAgg.map(o => ({
      overtimeHours: o._id,
      count: o.count
    }));

    // Send analytics response
    res.json({
      attendanceTrend,
      payrollTrend,
      departmentPayrollTrend,
      grievanceTrend,
      overtimeDistribution
    });

  } catch (err) {
    console.error("Analytics /analytics1 error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics", error: err.message });
  }
});





// --- Map schema names to Mongo models ---
const modelMap = {
  Payroll,
  Attendance,
  Grievance,
  User,
};

/* ============================================================
   1. GET LATEST ENTRY DATE FOR SELECTED SCHEMA
   ============================================================ */
router.get("/max-date/:schema", async (req, res) => {
  try {
    const { schema } = req.params;

    if (!modelMap[schema]) {
      return res.status(400).json({ error: "Invalid schema name" });
    }

    const Model = modelMap[schema];

    // Identify which date field is used by the schema
    let dateField = "createdAt"; // default

    if (schema === "Attendance") dateField = "date";
    if (schema === "Payroll") dateField = "createdAt";
    if (schema === "Grievance") dateField = "createdAt";
    if (schema === "User") dateField = "createdAt";

    const latest = await Model.find().sort({ [dateField]: -1 }).limit(1);

    if (!latest.length) return res.json({ maxDate: null });

    const maxDate = latest[0][dateField];

    res.json({ maxDate });
  } catch (err) {
    console.error("Max date error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   2. GET DATA BETWEEN SELECTED START DATE → LATEST ENTRY
   ============================================================ */
router.get("/data/:schema", async (req, res) => {
  try {
    const { schema } = req.params;
    const { startDate } = req.query;

    if (!modelMap[schema])
      return res.status(400).json({ error: "Invalid schema" });

    if (!startDate)
      return res.status(400).json({ error: "Start date required" });

    const Model = modelMap[schema];

    // Select date field
    let dateField = "createdAt";

    if (schema === "Attendance") dateField = "date";

    // Convert startDate
    const start = moment(startDate, "YYYY-MM-DD").startOf("day");

    // ----------- Query -----------
    let filter = {};

    if (schema === "Attendance") {
      filter[dateField] = { $gte: start.format("YYYY-MM-DD") };
    } else {
      filter[dateField] = { $gte: start.toDate() };
    }

    let query = Model.find(filter).lean();

    // Populate relations
    if (schema === "Payroll") query = query.populate("userId", "employeeId firstName lastName department");
    if (schema === "Attendance") query = query.populate("userId", "employeeId firstName lastName");
    if (schema === "Grievance") query = query.populate("userId", "employeeId firstName lastName");
    if (schema === "User") query = query.populate("supervisorId", "firstName lastName employeeId");

    const data = await query;

    // Flatten populated fields for excel
    const cleaned = data.map((doc) => {
      const flat = {};

      for (const [key, value] of Object.entries(doc)) {
        if (value && typeof value === "object" && !Array.isArray(value) && value._id) {
          // Flatten populated fields
          for (const [k, v] of Object.entries(value)) {
            if (k !== "_id") flat[`${key}_${k}`] = v;
          }
        } else {
          flat[key] = value;
        }
      }
      return flat;
    });

    res.json(cleaned);
  } catch (err) {
    console.error("Export fetch error:", err);
    res.status(500).json({ error: "Failed to fetch export data" });
  }
});


export default router;
