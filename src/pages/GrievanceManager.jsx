import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Input, Card, message, Modal } from "antd";
import axios from "axios";

const { Search, TextArea } = Input;

const GrievancesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Replace with your session management
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const role = session?.user?.role || "";
  const canManage = role === "HR" || role === "Supervisor" || role === "Owner";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3010/grievance/all", {
        params: { role: role.toLowerCase(), userId: session?.user?.id }
      });
      setData(res.data.data || []);
      setFilteredData(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load grievances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (record, status) => {
    setSelected({ ...record, newStatus: status });
    setAdminNotes("");
    setCloseModal(true);
  };

  const submitStatusChange = async () => {
    if (!adminNotes.trim()) {
      message.warning("Admin Notes Required");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:3010/grievance/update/${selected._id}`,
        { status: selected.newStatus, adminNotes }
      );

      if (res.data.success) {
        message.success(`Ticket ${selected.newStatus} successfully`);
        setCloseModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update ticket");
    }
  };

  const onSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter(
      (item) =>
        item.ticketId.toLowerCase().includes(value.toLowerCase()) ||
        item.employeeId?.toLowerCase().includes(value.toLowerCase()) ||
        item.userName?.toLowerCase().includes(value.toLowerCase()) ||
        item.description?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
      sorter: (a, b) => a.ticketId.localeCompare(b.ticketId),
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      key: "employeeId",
      sorter: (a, b) => (a.employeeId || "").localeCompare(b.employeeId || ""),
      render: (_, record) =>
        record.isAnonymous ? <Tag color="blue">Anonymous</Tag> : record.employeeId || "Unknown",
    },
    {
      title: "Employee Name",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => (a.userName || "").localeCompare(b.userName || ""),
      render: (_, record) =>
        record.isAnonymous ? <Tag color="blue">Anonymous</Tag> : record.userName || "Unknown",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Safety", value: "Safety" },
        { text: "Harassment", value: "Harassment" },
        { text: "Salary", value: "Salary" },
        { text: "Other", value: "Other" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Open", value: "Open" },
        { text: "In-Progress", value: "In-Progress" },
        { text: "Resolved", value: "Resolved" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (v) => {
        const color = v === "Open" ? "red" : v === "In-Progress" ? "orange" : "green";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "Admin Notes",
      dataIndex: "adminNotes",
      key: "adminNotes",
      width: 200,
      render: (v) => v || <span style={{ color: "#888" }}>—</span>,
    },
    {
      title: "Actions",
    fixed: 'end',
      key: "actions",
      width: 220,
      render: (_, record) => {
        if (!canManage) return <span style={{ color: "#888" }}>No Actions</span>;

        const buttons = [];
        if (record.status === "Open") {
          buttons.push(
            <Button
              key="inprogress"
              type="default"
              style={{ marginRight: 5 }}
              onClick={() => openModal(record, "In-Progress")}
            >
              Mark In-Progress
            </Button>
          );
        }
        if (record.status !== "Resolved") {
          buttons.push(
            <Button key="resolve" type="primary" onClick={() => openModal(record, "Resolved")}>
              Close Ticket
            </Button>
          );
        }
        return <>{buttons.length ? buttons : <span style={{ color: "#888" }}>No Actions</span>}</>;
      },
    },
  ];

  return (
    <Card title="Grievances Management">
      <Search
        placeholder="Search by Ticket, Employee ID, Name, Description"
        onSearch={onSearch}
        enterButton
        style={{ marginBottom: 16 }}
      />

      <Table
          scroll={{ x: 'max-content' }}
          
        rowKey="_id"
        dataSource={filteredData}
        loading={loading}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Update Ticket - ${selected?.ticketId}`}
        open={closeModal}
        onCancel={() => setCloseModal(false)}
        onOk={submitStatusChange}
        okText="Submit"
      >
        <h4>Add Admin Notes</h4>
        <TextArea
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Write your notes..."
        />
      </Modal>
    </Card>
  );
};

export default GrievancesTable;
