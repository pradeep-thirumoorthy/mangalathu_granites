import React, { useEffect, useState } from "react";
import { Table, Card, Spin, DatePicker, Tag, Button, InputNumber, message } from "antd";
import dayjs from "dayjs";

const { MonthPicker } = DatePicker;

const SalesExecutivePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [commissionInputs, setCommissionInputs] = useState({});

  // Fetch employees whose payroll is NOT generated for the selected month
  const fetchEmployees = async (monthObj = selectedMonth) => {
    setLoading(true);
    const month = monthObj.month() + 1;
    const year = monthObj.year();

    try {
      const res = await fetch(
        `http://localhost:3010/payroll/employees?department=Showroom&month=${month}&year=${year}`
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        message.error(data.error || "Failed to fetch employees");
        setEmployees([]);
        return;
      }

      setEmployees(data);

      // Initialize payroll placeholders
      const placeholders = {};
      data.forEach(emp => {
        placeholders[emp._id] = {
          financials: {
            baseSalary: emp.baseSalary || 0,
            commissionEarned: 0,
            overtimePay: 0,
            netSalary: 0
          },
          status: "Not Generated"
        };
      });
      setPayrolls(placeholders);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate payroll for a single employee
  const generatePayroll = async (employeeId) => {
    const commissionAmount = commissionInputs[employeeId] || 0;
    const month = selectedMonth.month() + 1;
    const year = selectedMonth.year();

    try {
      const res = await fetch(`http://localhost:3010/payroll/generate/${employeeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionAmount, month, year })
      });

      const data = await res.json();
      if (res.ok) {
        message.success("Payroll generated");
        setPayrolls(prev => ({
          ...prev,
          [employeeId]: data.payroll
        }));
        // Remove employee from list since payroll is generated
        setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
        window.location.reload();
      } else {
        message.error(data.error || "Failed to generate payroll");
      }
    } catch (err) {
      console.error(err);
      message.error("Error generating payroll");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedMonth]);

const columns = [
  {
    title: "Employee",
    dataIndex: "firstName",
    key: "name",
    render: (_, record) => `${record.firstName} ${record.lastName}`
  },
  {
    title: "Employee ID",
    dataIndex: "employeeId",
    key: "employeeId"
  },
  {
    title: "Base Salary",
    key: "baseSalary",
    render: (_, record) =>
      `₹${record.baseSalary?.toLocaleString() || 0}`
  },
  {
    title: "Commission (Edit)",
    key: "commission",
    render: (_, record) => (
      <InputNumber
        min={0}
        value={commissionInputs[record._id] || 0}
        onChange={(val) =>
          setCommissionInputs(prev => ({ ...prev, [record._id]: val }))
        }
        formatter={(v) => `₹${v}`}
        parser={(v) => v.replace(/\₹|\s/g, "")}
        disabled={record.role === "Showroom_Supervisor"} // disable for supervisors
      />
    )
  },
  {
    title: "Net Salary",
    key: "netSalary",
    render: (_, record) => {
      const baseSalary = record.baseSalary || 0;
      const commission = commissionInputs[record._id] || 0;
      const commissionRate = record.commissionRate || 1; // 100% if full amount
      const overtimePay = record.overtimePay || 0;
      const taxRate = record.taxRate || 0.05; // 5% default

      const commissionEarned =
        record.role === "Showroom_Supervisor" ? 0 : commission * commissionRate;
      const grossSalary = baseSalary + commissionEarned + overtimePay;
      const taxAmount = grossSalary * taxRate;
      const netSalary = grossSalary - taxAmount;

      return <strong>₹{netSalary.toLocaleString()}</strong>;
    }
  },
  {
    title: "Action",
    fixed: "end",
    key: "action",
    render: (_, record) => (
      <Button
        type="primary"
        onClick={() => generatePayroll(record._id)}
      >
        Generate Payroll
      </Button>
    )
  }
];


  return (
    <Card
      title="Sales Executives Payroll"
      extra={
        <MonthPicker
          value={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
        />
      }
      style={{ margin: 20 }}
    >
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
      ) : (
        <Table
          scroll={{ x: 'max-content' }}
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={employees}
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default SalesExecutivePayroll;
