import React, { useEffect, useState } from "react";
import { Table, Card, Spin, DatePicker, Tag, message, Button, Popconfirm } from "antd";
import dayjs from "dayjs";

const { MonthPicker } = DatePicker;

const PayrollHistory = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const fetchPayrolls = async (monthObj = selectedMonth) => {
    setLoading(true);
    const month = monthObj.month() + 1;
    const year = monthObj.year();

    try {
      const res = await fetch(
        `http://localhost:3010/payroll/department?department=Showroom&month=${month}&year=${year}`
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        message.error(data.error || "Failed to fetch payrolls");
        setPayrolls([]);
        return;
      }

      setPayrolls(data);
    } catch (err) {
      console.error(err);
      message.error("Error fetching payrolls");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  // Delete payroll
  const handleDelete = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://localhost:3010/payroll/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Payroll deleted");
        setPayrolls(prev => prev.filter(p => p._id !== id));
      } else {
        const data = await res.json();
        message.error(data.error || "Failed to delete payroll");
      }
    } catch (err) {
      console.error(err);
      message.error("Error deleting payroll");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Proceed payment
  const handleProceedPayment = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://localhost:3010/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" })
      });

      if (res.ok) {
        message.success("Payment processed");
        setPayrolls(prev =>
          prev.map(p => (p._id === id ? { ...p, status: "Paid" } : p))
        );
      } else {
        const data = await res.json();
        message.error(data.error || "Failed to process payment");
      }
    } catch (err) {
      console.error(err);
      message.error("Error processing payment");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: ["userId", "firstName"],
      key: "name",
      render: (_, record) => `${record.userId.firstName} ${record.userId.lastName}`
    },
    {
      title: "Employee ID",
      dataIndex: ["userId", "employeeId"],
      key: "employeeId"
    },
    {
      title: "Base Salary",
      dataIndex: ["financials", "baseSalary"],
      key: "baseSalary",
      render: (v) => `₹${v?.toLocaleString() || 0}`
    },
    {
      title: "Commission",
      dataIndex: ["financials", "commissionEarned"],
      key: "commission",
      render: (v) => `₹${v?.toLocaleString() || 0}`
    },
    {
      title: "Overtime Pay",
      dataIndex: ["financials", "overtimePay"],
      key: "overtime",
      render: (v) => `₹${v?.toLocaleString() || 0}`
    },
    {
      title: "Net Salary",
      dataIndex: ["financials", "netSalary"],
      key: "netSalary",
      render: (v) => <strong>₹{v?.toLocaleString() || 0}</strong>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) =>
        v === "Paid" ? <Tag color="green">{v}</Tag> : <Tag color="orange">{v}</Tag>
    },
    {
  title: "Actions",
    fixed: 'end',
  key: "actions",
  render: (_, record) => {
    // Show buttons only if status is "Processing"
    if (record.status === "Processing") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <Popconfirm
            title="Are you sure you want to delete this payroll?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type="default"
              danger
              loading={actionLoading[record._id]}
            >
              Delete
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            loading={actionLoading[record._id]}
            onClick={() => handleProceedPayment(record._id)}
          >
            Proceed Payment
          </Button>
        </div>
      );
    } else {
      // Return null if not processing (buttons hidden)
      return null;
    }
  }
}

  ];

  return (
    <Card
      title="Payroll History"
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
          dataSource={payrolls}
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default PayrollHistory;
