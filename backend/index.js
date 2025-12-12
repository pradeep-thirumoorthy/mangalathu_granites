import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import payrollRoutes from './routes/payroll.js'
import HrRoutes from "./routes/Employees.js";
import GRoutes from './routes/grievance.js'
import CalendarRoute from './routes/calendar.js'
import Att from './routes/attendance.js'
import Ann from './routes/Announcements.js'
import Dashboard from './routes/dashboard.js'
import Employee from './routes/Employees.js'
import services from './routes/services.js'

// import userRoutes from './user/userRoutes.js';
// import adminRoutes from './admin/adminRoutes.js';
import { User, Attendance} from './schema.js';


const uri = "mongodb://127.0.0.1:27017/Mangalathu"; // <-- LOCAL DB DIRECT

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

connectToDatabase();

const app = express();
const port = 3010;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://10.91.167.200:5173"
  ],
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

app.get("/", (req, res) => {
  res.send("Express on Local MongoDB");
});

app.use("/hr", HrRoutes);
app.use("/grievance", GRoutes);
app.use("/payroll", payrollRoutes);
app.use('/att', Att);
app.use('/ann', Ann);
app.use('/dashboard', Dashboard);
app.use('/emp', Employee);
app.use('/calendar', CalendarRoute);
app.use('/export',services)
// app.use('/admin', adminRoutes);



app.post('/login', async (req, res) => {
  try {
    const { email, password, type } = req.body;
    console.log(req.body)
    if (!email || !password || !type) {
      return res.status(400).json({ error: "Email, password and user are required." });
    }

    // Match user by phone and password (no hashing)
    const user = await User.findOne({ email, password, role:type });
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Invalid login." });
    }

    // Return only requested fields
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        employeeId:user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ msg: 'Internal Server Error', err: err.stack });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});












  import cron from "node-cron";
  // Run every day at 9:01 PM
  cron.schedule("1 21 * * *", async () => {  // 9:01 PM
  try {
    const today = new Date();

    // --- Ignore Sundays ---
    if (today.getDay() === 0) {  // 0 = Sunday
      console.log("Today is Sunday, skipping absence marking.");
      return;
    }

    const dateStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Only include employees (exclude HR, Owners, Supervisors)
    const employeeRoles = ["Sales_Executive"];

    // 1. All active employees
    const employees = await User.find({
      isActive: true,
      role: { $in: employeeRoles }
    });

    // 2. Attendance records for today
    const attendedToday = await Attendance.find({ date: dateStr }).select("userId");
    const attendedIds = attendedToday.map(a => a.userId.toString());

    // 3. Leaves for today
    const leaveToday = await Leave.find({ date: dateStr }).select("userId");
    const leaveIds = leaveToday.map(l => l.userId.toString());

    // 4. Employees who:
    //    - did NOT attend
    //    - are NOT on leave
    const absentEmployees = employees.filter(e =>
      !attendedIds.includes(e._id.toString()) &&
      !leaveIds.includes(e._id.toString())
    );

    // 5. Insert Absent records
    const absentRecords = absentEmployees.map(e => ({
      userId: e._id,
      date: dateStr,
      status: "Absent",
      clockIn: null,
      clockOut: null,
    }));

    if (absentRecords.length > 0) {
      await Attendance.insertMany(absentRecords);
      console.log(`Marked ${absentRecords.length} employees as Absent for ${dateStr}`);
    } else {
      console.log("No absentees today");
    }

  } catch (err) {
    console.error("Error marking absentees:", err);
  }
});



export default app;
