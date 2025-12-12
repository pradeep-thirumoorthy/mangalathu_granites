import React, { useEffect, useState } from "react";
import { Table, Card, Spin, DatePicker, Tag, message, Button, Popconfirm, InputNumber } from "antd";
import dayjs from "dayjs";

const { MonthPicker } = DatePicker;

const WarehousePayrollHistory = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [editingHours, setEditingHours] = useState({}); // editable overtime hours

  const fetchPayrolls = async (monthObj = selectedMonth) => {
    setLoading(true);
    const month = monthObj.month() + 1;
    const year = monthObj.year();

    try {
      const res = await fetch(
        `http://localhost:3010/payroll/department?department=Warehouse&month=${month}&year=${year}`
      );

      const data = await res.json();
      console.log(data)
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        message.error(data.error || "Failed to fetch payrolls");
        setPayrolls([]);
        return;
      }

      // Store overtimeHours for editing UI
      const init = {};
      data.forEach((row) => {
        init[row._id] = row.financials?.overtimeHours || 0;
      });

      setEditingHours(init);
      setPayrolls(data);
    } catch (err) {
      console.error(err);
      message.error("Error fetching payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  // ---- DELETE PAYROLL ----
  const handleDelete = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`http://localhost:3010/payroll/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        message.error(data.error || "Failed to delete payroll");
      } else {
        message.success("Payroll deleted");
        setPayrolls((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
      message.error("Error deleting payroll");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ---- UPDATE PAYMENT STATUS ----
  const handleProceedPayment = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`http://localhost:3010/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" }),
      });

      if (!res.ok) {
        const data = await res.json();
        message.error(data.error || "Failed to process payment");
      } else {
        message.success("Payment processed");
        setPayrolls((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: "Paid" } : p))
        );
      }
    } catch (err) {
      console.error(err);
      message.error("Error updating status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ---- EDIT OVERTIME HOURS ----
  const handleUpdateHours = async (record) => {
    const newHours = editingHours[record._id];

    setActionLoading((prev) => ({ ...prev, [record._id]: true }));

    try {
      const res = await fetch(`http://localhost:3010/payroll/update-overtime/${record._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overtimeHours: newHours }),
      });

      if (!res.ok) {
        const data = await res.json();
        message.error(data.error || "Failed to update overtime hours");
        return;
      }

      message.success("Updated overtime hours");

      fetchPayrolls(selectedMonth); // refresh
    } catch (err) {
      console.error(err);
      message.error("Error updating hours");
    } finally {
      setActionLoading((prev) => ({ ...prev, [record._id]: false }));
    }
  };

  const columns = [
    {
      title: "Employee",
      render: (_, record) =>
        `${record.userId.firstName} ${record.userId.lastName}`,
    },
    {
      title: "Employee ID",
      dataIndex: ["userId", "employeeId"],
    },
    {
      title: "Base Salary",
      dataIndex: ["financials", "baseSalary"],
      render: (v) => `₹${v || 0}`,
    },

    // ---------------- OVERTIME HOURS EDITABLE ----------------
    
    {
      title: "Overtime Pay",
      dataIndex: ["financials", "overtimePay"],
      render: (v) => `₹${v || 0}`,
    },

    {
      title: "Net Salary",
      dataIndex: ["financials", "netSalary"],
      render: (v) => <strong>₹{v || 0}</strong>,
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (v) =>
        v === "Paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="orange">Processing</Tag>
        ),
    },

    // ---------------- ACTION BUTTONS ----------------
    {
      title: "Actions",
    fixed: 'end',
      render: (_, record) =>
        record.status === "Processing" ? (
          <div style={{ display: "flex", gap: 8 }}>
            

            <Button
              type="primary"
              loading={actionLoading[record._id]}
              onClick={() => handleProceedPayment(record._id)}
            >
              Proceed Payment
            </Button>

            <Popconfirm
              title="Delete payroll?"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button danger loading={actionLoading[record._id]}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  return (
    <Card
      title="Warehouse Payroll History"
      extra={
        <MonthPicker
          value={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
        />
      }
      style={{ margin: 20 }}
    >
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      ) : (
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={payrolls}
          rowKey={(r) => r._id}
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default WarehousePayrollHistory;
