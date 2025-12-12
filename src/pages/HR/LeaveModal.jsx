import React, { useState, useEffect } from "react";
import { Modal, Input, DatePicker, Button, Table, Tag, message, Card } from "antd";

const { TextArea } = Input;

const LeaveManager = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("Holiday");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================
  // Compute current month date range
  // ============================================
  const getMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0–11

    const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    return { startDate, endDate };
  };

  // ============================================
  // Load leaves for current month
  // ============================================
  const loadLeaves = async () => {
    const { startDate, endDate } = getMonthRange();

    try {
      const res = await fetch(
        `http://localhost:3010/ann/leaves?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
      );

      const data = await res.json();
      setLeaves(data || []);
    } catch {
      message.error("Failed to load leaves");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const deleteLeave = async (id) => {
  try {
    setLoading(true);

    const res = await fetch(`http://localhost:3010/ann/leaves/delete/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Delete failed");

    message.success("Leave deleted");
    loadLeaves();
  } catch (err) {
    message.error(err.message);
  } finally {
    setLoading(false);
  }
};


  // ============================================
  // Submit Leave
  // ============================================
  const submit = async () => {
    if (!date || !reason.trim()) {
      message.error("Date & reason required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3010/ann/leaves/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date, reason, type }),
      });

      if (!res.ok) throw new Error("Failed to create leave");

      message.success("Leave submitted");
      setOpen(false);
      loadLeaves(); // refresh list
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Table Columns
  // ============================================
  const columns = [
    { title: "Date", dataIndex: "date", width: 120 },
    { title: "Reason", dataIndex: "reason" },
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      render: (t) => <Tag>{t}</Tag>,
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   width: 120,
    //   render: (s) => (
    //     <Tag
    //       color={
    //         s === "Approved" ? "green" : s === "Rejected" ? "red" : "blue"
    //       }
    //     >
    //       {s}
    //     </Tag>
    //   ),
    // },
    {
  title: "Action",
    fixed: 'end',
  key: "action",
  width: 120,
  render: (record) => (
    <Button
      danger
      onClick={() => deleteLeave(record._id)}
      size="small"
    >
      Delete
    </Button>
  ),
},

  ];

  return (
    <Card
    title="Holiday Management"
          extra={
            <Button type="primary" onClick={() => setOpen(true)}>
        Add Leave
      </Button>
          }
          style={{ margin: "20px" }}>
      

      <Table
      
          scroll={{ x: 'max-content' }}
        dataSource={leaves}
        columns={columns}
        rowKey="_id"
        style={{ marginTop: 20 }}
      />

      <Modal
        open={open}
        title="Add Leave"
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={submit}>
            Submit
          </Button>,
        ]}
      >
        <label>Date</label>
        <DatePicker
          style={{ width: "100%", marginBottom: 10 }}
          onChange={(d) => setDate(d.format("YYYY-MM-DD"))}
        />

        <label>Reason</label>
        <TextArea
          rows={3}
          style={{ marginBottom: 10 }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: "100%", padding: 5 }}
        >
          <option value="Holiday">Holiday</option>
          <option value="General">General</option>
          <option value="Emergency">Emergency</option>
        </select>
      </Modal>
    </Card>
  );
};

export default LeaveManager;
