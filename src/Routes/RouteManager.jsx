import React from 'react';

// --- IMPORTS ---
// Owner & HR
import OwnerDashboard from "../pages/Owner/Dashboard";
import OwnerAnalytics from "../pages/Owner/Analytics";


import HrDashboard from "../pages/HR/Dashboard";
import EmployeeDirectory from "../pages/HR/Employees";
import AttendanceMasterLog from "../pages/AttendanceLog"; 
import PayrollGenerator from "../pages/HR/Payroll";
import HRAnnouncements from '../pages/HR/Announcements';

// Supervisors
import SalesDashboard from "../pages/Supervisor/ShowroomDashboard";
import Attendance from "../pages/Supervisor/Attendance"; // Showroom: Just Scan -> Present

import WareDashboard from "../pages/Supervisor/WarehouseDashboard";
import ShiftRoster from "../pages/Supervisor/Roster";


import GrievanceManager from "../pages/GrievanceManager"

// Workers (Sales & Warehouse)
import ExecutiveDashboard from "../pages/Worker/SalesDashboard"; 
import WorkerDashboard from "../pages/Worker/WorkerDashboard"; // Contains the Static QR Widget
import AttendanceHistory from "../pages/Worker/History";
import GrievanceEntry from '../pages/Worker/Grievance'
import AttendanceScanner from '../pages/Supervisor/Attendance';
import SalesInstructionsCards from '../pages/Worker/SalesInstruction';
import WageWorkersTimeline from '../pages/Worker/WagesInstruction';
import Export from '../pages/Owner/Export';
import EmployeeView from '../pages/CalendarView';
export const routeConfig = {
  
  // 1️⃣ OWNER (Top-Level Strategy Only)
  Owner: [
    { path: "", label: "Dashboard", icon: "PieChartOutlined", element: <OwnerDashboard /> },
    { path: "employees", label: "Employee Directory", icon: "TeamOutlined", element: <EmployeeDirectory /> },
    { path: "analytics", label: "Cost & Trends", icon: "LineChartOutlined", element: <OwnerAnalytics /> },
    { path: "Export", label: "Export", icon: "TableOutlined", element: <Export /> },
  ],

  // 2️⃣ HR ADMIN (Full Control)
  HR: [
    { path: "", label: "Dashboard", icon: "DashboardOutlined", element: <HrDashboard /> },
    { path: "employees", label: "Employee Directory", icon: "TeamOutlined", element: <EmployeeDirectory /> },
    { path: "attendance-log", label: "Master Attendance", icon: "ScheduleOutlined", element: <AttendanceMasterLog /> },
    { path: "payroll", label: "Payroll Processing", icon: "BankOutlined", element: <PayrollGenerator /> },
    { path: "announcements", label: "Announcements", icon: "NotificationOutlined", element: <HRAnnouncements /> },
    { path: "grievances", label: "Grievance Panel", icon: "WarningOutlined", element: <GrievanceManager /> },
  ],

  // 3️⃣ SHOWROOM SUPERVISOR
  Showroom_Supervisor: [
    { path: "", label: "Team Status", icon: "AppstoreOutlined", element: <SalesDashboard /> },
    { path: "scan", label: "Scan Attendance", icon: "ScanOutlined", element: <Attendance /> },
    { path: "attendance-log", label: "Attendance", icon: "ScheduleOutlined", element: <AttendanceMasterLog /> },
    { path: "grievances", label: "Grievances", icon: "WarningOutlined", element: <GrievanceManager /> },
  ],

  // 4️⃣ WAREHOUSE SUPERVISOR
  Warehouse_Supervisor: [
    { path: "", label: "Yard Status", icon: "AppstoreOutlined", element: <WareDashboard /> },
    { path: "scan-roster", label: "Scan & Allocate", icon: "QrcodeOutlined", element: <AttendanceScanner /> },
    { path: "attendance-log", label: "Attendance", icon: "ScheduleOutlined", element: <AttendanceMasterLog /> },
    { path: "view-roster", label: "Editorial Calendar", icon: "CalendarOutlined", element: <ShiftRoster /> },
    { path: "grievances", label: "Grievance Panel", icon: "WarningOutlined", element: <GrievanceManager /> },
  ],

  // 5️⃣ SALES EXECUTIVE
  Sales_Executive: [
    { path: "", label: "My Dashboard", icon: "UserOutlined", element: <ExecutiveDashboard /> },
    { path: "history", label: "Attendance History", icon: "HistoryOutlined", element: <AttendanceHistory /> },
    { path: "Instructions", label: "Instructions", icon: "QuestionCircleOutlined", element: <SalesInstructionsCards /> },
    { path: "grievance", label: "Submit Grievance", icon: "AlertOutlined", element: <GrievanceEntry /> },
  ],

  // 6️⃣ WAREHOUSE WORKER
  Warehouse_Worker: [
    { path: "", label: "My Dashboard", icon: "UserOutlined", element: <WorkerDashboard /> },
    { path: "history", label: "Attendance History", icon: "HistoryOutlined", element: <AttendanceHistory /> },
    { path: "view-roster", label: "Calendar", icon: "CalendarOutlined", element: <EmployeeView /> },
    
    { path: "Instructions", label: "Instructions", icon: "QuestionCircleOutlined", element: <WageWorkersTimeline /> },
    ,{ path: "grievance", label: "Submit Grievance", icon: "AlertOutlined", element: <GrievanceEntry /> },
  ],
};


export const getRoutesForRole = (role) => {
  const base = `/${role}`;

  return (routeConfig[role] || []).map(route => ({
    ...route,
    path: route.path === "/" ? base : `${base}${route.path}`
  }));
};
