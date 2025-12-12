import express from "express";
import { User } from "../schema.js";
const router = express.Router();
// === GET ALL EMPLOYEES ===
router.get("/employees", async (req, res) => {
  try {
    const users = await User.find({
  department: { $in: ["Showroom", "Warehouse"] }
});

    console.log("ajkkfv")
    res.json(users);
  } catch (err) {
    console.error("Fetch Employee Error:", err);
    res.status(500).json({ error: "Failed to retrieve employees" });
  }
});

router.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateFields = {};

    // Only update things that are sent
    const allowed = [
      "firstName",
      "lastName",
      "phone",
      "department",
      "role",
      "isActive",
      "baseSalary",
      "address"
    ];

    for (let key of allowed) {
      if (req.body[key] !== undefined) updateFields[key] = req.body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Updated Successfully", user: updatedUser });
  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ error: "Failed to update employee data" });
  }
});

router.post("/addemployees", async (req, res) => {
  try {
    const allowed = [
      "employeeId",
      "firstName",
      "lastName",
      "email",
      "role",
      "department",
      "baseSalary",
      "isActive",
      "address",
    ];

    const newUserData = {};
    newUserData.password = req.body.password || "admin123"
    if(req.body.role == "Sales_Executive"){
    newUserData.department = "Showroom"
    }
    else{
    newUserData.department = "Warehouse"
    }
    for (let key of allowed) {
      if (req.body[key] !== undefined) newUserData[key] = req.body[key];
    }

    const newUser = new User(newUserData);
    console.log(newUser)
    await newUser.save();
    res.status(201).json({ message: "Employee added successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add employee" });
  }
});




export default router;
