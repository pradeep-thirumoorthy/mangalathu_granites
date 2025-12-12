import mongoose from "mongoose";

// 1. USER SCHEMA (Employees, Supervisors, Admin)
const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true }, // e.g., EMP001
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, required: true, unique: true }, // Primary login method
  password: { type: String, required: true }, // Hashed
  
  // Role Management
  role: { 
    type: String,
    enum: ['Owner', 'HR', 'Showroom_Supervisor', 'Warehouse_Supervisor', 'Sales_Executive', 'Warehouse_Worker'],
    required: true 
  },
  department: { type: String, enum: ['Showroom', 'Warehouse', 'Office'] },
  
  // Reporting Hierarchy
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Financial Configuration
  baseSalary: Number,
  overtimeHours: Number,      // For Warehouse Workers (Overtime calc)
  commissionRate: Number,  // For Sales Executives (% of sales)
  
  // Leave Balances
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    privilege: { type: Number, default: 15 }
  },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');


// 2. ATTENDANCE SCHEMA (Geo-fencing & Time Tracking)
const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },

  date: { type: String, required: true }, // YYYY-MM-DD

  clockIn: { type: Date, default: null },
  clockOut: { type: Date, default: null },

  overtimeHours: { type: Number, default: 0 },

  status: { type: String, default: "Present" },

  earlyLeaveReason: { type: String, default: null },

  // NEW FIELD → Needed for warehouse workers only
  scheduleId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Calendar",
  default: null,
}
});









const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendance_logs');


// 3. LEAVE & EXPENSE REQUEST SCHEMA (Approvals)
// const requestSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   type: { type: String, enum: ['Leave', 'Expense'], required: true },
  
//   // For Leave
//   leaveType: { type: String, enum: ['Casual', 'Sick', 'Privilege'] },
//   startDate: Date,
//   endDate: Date,
  
//   // For Expense
//   expenseAmount: Number,
//   expenseCategory: String, // Travel, Food
//   proofImage: String, // URL to receipt

//   reason: String,
  
//   // Approval Workflow
//   status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
//   actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Supervisor/HR
//   rejectionReason: String,
  
//   createdAt: { type: Date, default: Date.now }
// });

// const Request = mongoose.model('Request', requestSchema, 'requests');


// 4. PAYROLL SCHEMA (Monthly Snapshot)

const PayrollSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  department: { type: String, required: true },

  month: { type: Number, required: true },  // 1–12
  year: { type: Number, required: true },

  financials: {
    baseSalary: { type: Number, default: 0 },

    // --- wage workers ---
    overtimeHours: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },

    // --- common ---
    grossSalary: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 }
  },

  status: {
    type: String,
    enum: ["Processing", "Paid"],
    default: "Processing"
  },

  createdAt: { type: Date, default: Date.now }
});


const Payroll = mongoose.model('Payroll', PayrollSchema, 'payrolls');


// 5. GRIEVANCE SCHEMA (Anonymous Reporting)
const grievanceSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isAnonymous: { type: Boolean, default: false },

  category: { type: String, enum: ["Safety", "Harassment", "Salary", "Other"], required: true },
  description: { type: String, required: true },

  status: { type: String, enum: ["Open", "In-Progress", "Resolved"], default: "Open" },

  adminNotes: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now }
});
const Grievance = mongoose.model('Grievance', grievanceSchema, 'grievances');


// 6. NOTICE BOARD SCHEMA (Communication)
const noticeSchema = new mongoose.Schema({
  title: String,
  content: String,
  targetAudience: { type: String, enum: ['All', 'Showroom', 'Warehouse'] },
  createdAt: { type: Date, default: Date.now }
});

const Notice = mongoose.model('Notice', noticeSchema, 'notices');


const LeaveSchema = new mongoose.Schema({
  date: { type: String, required: true },   // "YYYY-MM-DD"
  reason: { type: String, required: true },
  type: { type: String, default: "Leave" }, // optional, but useful later
});

const Leave = mongoose.model('Leave', LeaveSchema, 'leaves');



const CalendarSchema = new mongoose.Schema({
  userIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g., "12:00"
  endTime: { type: String, required: true },   // e.g., "15:00"
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const  Calendar= mongoose.model("Calendar", CalendarSchema, "calendar");
export { User, Attendance, 
  //Request,
   Payroll, Grievance, Notice,Leave,Calendar };