import express from "express";
import { Attendance, Payroll, User } from "./../schema.js";

const router = express.Router();

router.get("/department", async (req, res) => {
  try {
    const { department, month, year } = req.query;

    if (!department || !month || !year) {
      return res.status(400).json({ error: "Missing filters" });
    }

    const payrolls = await Payroll.find({
      month: Number(month),
      year: Number(year)
    })
      .populate("userId", 
        "firstName lastName employeeId department baseSalary overtimeRate taxRate"
      );

    const filtered = payrolls
      .filter((p) => p.userId?.department === department)
      .map((p) => ({
        _id: p._id,
        userId: {
          firstName: p.userId.firstName,
          lastName: p.userId.lastName,
          employeeId: p.userId.employeeId,
        },
        financials: {
          baseSalary: p.financials.baseSalary,
          commissionEarned: p.financials.commissionEarned || 0,
          overtimePay: p.financials.overtimePay || 0,
          netSalary: p.financials.netSalary,
          overtimeRate: p.userId.overtimeRate || 100,  // DEFAULT applied cleanly
          taxRate: p.userId.taxRate || 0.05
        },
        status: p.status,
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Payroll Fetch Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});



// routes/payrollRoutes.js

router.post("/generate/:employeeId", async (req, res) => {
  try {
    const { commissionAmount = 0 } = req.body;
    const user = await User.findById(req.params.employeeId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // --- Payroll Calculation ---
    const base = user.baseSalary || 0;          // Base salary from user
    const commissionRate = user.commissionRate || 0;
    const taxRate = user.taxRate || 0.05;

    const totalCommission = commissionAmount * commissionRate;
    const grossPay = base + totalCommission;
    const taxAmount = grossPay * taxRate;
    const netPay = grossPay - taxAmount;

    const payrollData = {
      userId: user._id,
      department: user.department,
      month: req.body.month || new Date().getMonth() + 1, // optionally pass month/year
      year: req.body.year || new Date().getFullYear(),
      financials: {
        baseSalary: base,
        commissionEarned: totalCommission,
        grossSalary: grossPay,
        taxRate,
        taxAmount,
        netSalary: netPay
      },
      status: "Processing"
    };

    // Save payroll
    const payroll = await Payroll.create(payrollData);

    res.json({ message: "Payroll generated", payroll });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payroll error" });
  }
});


router.get("/department", async (req, res) => {
  try {
    const { department, month, year } = req.query;

    if (!department || !month || !year) {
      return res.status(400).json({ error: "Missing filters" });
    }

    // Convert month/year to numbers
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    // Find all payrolls for the given month and year
    const payrolls = await Payroll.find({ month: monthNum, year: yearNum })
      .populate("userId", "firstName lastName employeeId department baseSalary commissionRate taxRate");

    // Filter by department
    const filtered = payrolls
      .filter(p => p.userId?.department === department)
      .map(p => ({
        _id: p._id,
        userId: {
          firstName: p.userId.firstName,
          lastName: p.userId.lastName,
          employeeId: p.userId.employeeId,
        },
        financials: {
          baseSalary: p.financials?.baseSalary || 0,
          commissionEarned: p.financials?.commissionEarned || 0,
          overtimePay: p.financials?.overtimePay || 0,
          netSalary: p.financials?.netSalary || 0,
        },
        status: p.status || "Processing",
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Payroll Fetch Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});



router.patch("/:id", async (req, res) => {
  const updates = req.body;

  const payroll = await Payroll.findById(req.params.id);
  if (!payroll) return res.status(404).json({ error: "Payroll not found" });

  // Update editable fields
  if (updates.taxRate !== undefined) payroll.taxRate = updates.taxRate;
  if (updates.commissionRate !== undefined) payroll.commissionRate = updates.commissionRate;
  if (updates.status) payroll.status = updates.status;

  // Recalculate dependent amounts
  payroll.taxAmount = (payroll.grossSalary * payroll.taxRate) / 100;
  payroll.commissionAmount = (payroll.baseSalary * payroll.commissionRate) / 100;
  payroll.netSalary = payroll.grossSalary + payroll.commissionAmount - payroll.taxAmount;

  await payroll.save();
  res.json({ message: "Payroll updated", payroll });
});

// Delete a payroll
router.delete("/:id", async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    if (payroll.status !== "Processing") {
      return res.status(400).json({ error: "Cannot delete payroll that is not processing" });
    }

    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: "Payroll deleted successfully" });
  } catch (err) {
    console.error("Delete Payroll Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Proceed payment (mark as Paid)
router.patch("/pay/:id", async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    if (payroll.status !== "Processing") {
      return res.status(400).json({ error: "Payroll is already paid or not eligible" });
    }

    payroll.status = "Paid";
    await payroll.save();

    res.json({ message: "Payment processed successfully", payroll });
  } catch (err) {
    console.error("Proceed Payment Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/", async (req, res) => {
  const data = await Payroll.find().populate("userId", "name department");
  res.json(data);
});



router.get("/employees", async (req, res) => {
  try {
    const { department, month, year } = req.query;

    if (!department || !month || !year) {
      return res.status(400).json({
        error: "Department, month, and year query parameters are required",
      });
    }

    // Step 1: Fetch payrolls for the month/year (only userId)
    const payrolls = await Payroll.find({
      month: Number(month),
      year: Number(year),
    }).select("userId");

    // Step 2: Convert registered userIds to string array
    const generatedUserIds = payrolls.map((p) => String(p.userId));

    // Step 3: Fetch only employees without payroll yet
    const employees = await User.find({
      department,
      isActive: true,
      _id: { $nin: generatedUserIds },
    }).select(
      "firstName lastName employeeId department baseSalary overtimeRate taxRate role"
    );

    // Step 4: Attach defaults for missing values
    const cleanedEmployees = employees.map((emp) => ({
      _id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      role:emp.role,
      employeeId: emp.employeeId,
      department: emp.department,
      baseSalary: emp.baseSalary || 0,
      overtimeRate: emp.overtimeRate ?? 100, // DEFAULT VALUE
      taxRate: emp.taxRate ?? 0.05, // If missing
    }));
    console.log(cleanedEmployees);

    res.json(cleanedEmployees);
  } catch (err) {
    console.error("Fetch employees error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// 📌 Generate Payroll for Wage Workers (NO COMMISSION)
router.post("/generate-wageworker/:employeeId", async (req, res) => {
  try {
    const {
      overtimeHours = 0,
      overtimeRate = 100,
      baseSalary = 0,
      taxRate = 0.05,
      month,
      year
    } = req.body;
    console.log(req.body)
    const user = await User.findById(req.params.employeeId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    // ---- FINANCIAL CALCULATIONS ----
    const overtimePay = overtimeHours * overtimeRate;
    const grossSalary = baseSalary + overtimePay;
    const taxAmount = grossSalary * taxRate;
    const netSalary = grossSalary - taxAmount;
    console.log(baseSalary,overtimeHours,grossSalary,netSalary)
    // ---- CREATE PAYROLL ----
    const payrollData = {
      userId: user._id,
      department: user.department,
      month: Number(month),
      year: Number(year),

      financials: {
        baseSalary,
        overtimeHours,
        overtimeRate,
        overtimePay,
        grossSalary,
        taxRate,
        taxAmount,
        netSalary
      },

      status: "Processing"
    };

    const payroll = await Payroll.create(payrollData);

    res.json({
      message: "Payroll generated successfully",
      payroll
    });

  } catch (err) {
    console.error("Payroll Generation Error:", err);
    res.status(500).json({ error: "Payroll generation failed" });
  }
});




export default router;