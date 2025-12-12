import React, { useEffect, useState } from "react";
import { Table, Card, Spin, DatePicker, Button, InputNumber, message } from "antd";
import dayjs from "dayjs";

const { MonthPicker } = DatePicker;

const WageWorkersPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [overtimeInputs, setOvertimeInputs] = useState({});

  // Fetch employees for payroll generation
  const fetchEmployees = async (monthObj = selectedMonth) => {
    setLoading(true);
    const month = monthObj.month() + 1;
    const year = monthObj.year();

    try {
      const res = await fetch(
        `http://localhost:3010/payroll/employees?department=Warehouse&month=${month}&year=${year}`
      );

      const data = await res.json();

      if (!Array.isArray(data)) {
        message.error(data.error || "Failed to fetch employees");
        setEmployees([]);
        return;
      }
      console.log(data)
      setEmployees(data);

      // Pre-fill overtime inputs (editable)
      const inputs = {};
      data.forEach(emp => {
        inputs[emp._id] = emp.overtimeHours || 0;
      });
      setOvertimeInputs(inputs);

    } catch (err) {
      console.error(err);
      message.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Generate payroll
  const generatePayroll = async (employeeId) => {
    const employee = employees.find(e => e._id === employeeId);

    if (!employee) {
      message.error("Employee not found");
      return;
    }

    const overtimeHours = overtimeInputs[employeeId] || 0;
    const month = selectedMonth.month() + 1;
    const year = selectedMonth.year();

    const payload = {
      overtimeHours,
      month,
      year,
      overtimeRate: employee.overtimeRate, // REQUIRED
      baseSalary: employee.baseSalary,     // Optional but useful
      taxRate: employee.taxRate           // Optional
    };

    try {
      const res = await fetch(
        `http://localhost:3010/payroll/generate-wageworker/${employeeId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (res.ok) {
        message.success("Payroll generated");
        setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
        window.location.reload();
      } else {
        message.error(data.error || "Unable to generate payroll");
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
      key: "name",
      render: (_, r) => `${r.firstName} ${r.lastName}`
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId"
    },
    {
      title: "Base Wage",
      render: (_, r) => `₹${r.baseSalary?.toLocaleString() || 0}`
    },
    {
      title: "Overtime Rate",
      render: (_, r) => `₹${r.overtimeRate || 0} / hr`
    },
    {
  title: "Overtime Hours (Editable)",
  key: "overtimeHours",
  render: (_, r) => (
    <InputNumber
      min={0}
      value={overtimeInputs[r._id]}
      onChange={(v) =>
        setOvertimeInputs(prev => ({ ...prev, [r._id]: v }))
      }
      disabled={r.role === "Warehouse_Supervisor"} // disable for supervisors
    />
  )
},
    {
      title: "Overtime Pay",
      key: "overtimePay",
      render: (_, r) => {
        const hours = overtimeInputs[r._id] || 0;
        const rate = r.overtimeRate || 0;
        return `₹${(hours * rate).toLocaleString()}`;
      }
    },
    {
      title: "Net Salary",
      key: "netSalary",
      render: (_, r) => {
        const base = r.baseSalary || 0;
        const hours = overtimeInputs[r._id] || 0;
        const overtimePay = hours * (r.overtimeRate || 0);

        const gross = base + overtimePay;
        const taxRate = r.taxRate || 0.05;
        const tax = gross * taxRate;
        const net = gross - tax;

        return <strong>₹{net.toLocaleString()}</strong>;
      }
    },
    {
      title: "Action",
    fixed: 'end',
      render: (_, r) => (
        <Button type="primary" onClick={() => generatePayroll(r._id)}>
          Generate Payroll
        </Button>
      )
    }
  ];

  return (
    <Card
      title="Wa Workers Payroll"
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

export default WageWorkersPayroll;
