import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Tag, Card } from "antd";
import NewAnnouncementModal from "./NewAnn";
import NewLeaveModal from "./LeaveModal";
import LeaveManager from "./LeaveModal";

const { TextArea } = Input;

const AnnouncementsTable = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");

  const [newModal, setNewModal] = useState(false);

  // SESSION VALUES
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const userId = session?.user?.id;
  const role = session?.user?.role;

  const canEdit = role === "Owner" || role === "HR";

  // LEAVES



  // FETCH ALL ANNOUNCEMENTS
  const fetchAnnouncements = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3010/ann?userId=${userId}`
      );
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // OPEN EDIT MODAL
  const openEditModal = (record) => {
    setSelected(record);
    setTitle(record.title);
    setContent(record.content);
    setTargetAudience(record.targetAudience);
    setEditModal(true);
  };

  // SAVE EDIT
  const saveEdit = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and Content cannot be empty");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3010/ann/update/${selected._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, targetAudience }),
        }
      );

      const data = await res.json();
      if (data.success) {
        message.success("Announcement updated");
        setEditModal(false);
        fetchAnnouncements();
      } else {
        message.error(data.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error");
    }
  };

  // DELETE ANNOUNCEMENT
  const deleteAnnouncement = async () => {
    if (!selected) return;

    try {
      const res = await fetch(
        `http://localhost:3010/ann/delete/${selected._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        message.success("Announcement deleted");
        setEditModal(false);
        fetchAnnouncements();
      } else {
        message.error(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error");
    }
  };


  // TABLE COLUMNS
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (text) =>
        text.length > 50 ? text.slice(0, 50) + "..." : text,
    },
    {
      title: "Audience",
      dataIndex: "targetAudience",
      key: "targetAudience",
      filters: [
        { text: "All", value: "All" },
        { text: "Showroom", value: "Showroom" },
        { text: "Warehouse", value: "Warehouse" },
      ],
      onFilter: (value, record) => record.targetAudience === value,
      render: (v) => (
        <Tag color={v === "All" ? "blue" : "green"}>{v}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Actions",
    fixed: 'end',
      key: "actions",
      render: (_, record) =>
        canEdit ? (
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>
        ) : (
          <span style={{ color: "#888" }}>No Actions</span>
        ),
    },
  ];

  return (
    <div>
    <Card
      title="Announcements Management"
      extra={
        <Button type="primary" onClick={() => setNewModal(true)}>
          Add Announcement
        </Button>
      }
      style={{ margin: "20px" }}
    >
      {/* NEW ANNOUNCEMENT MODAL */}
      <NewAnnouncementModal
        open={newModal}
        onClose={() => setNewModal(false)}
        onCreated={fetchAnnouncements}
        postedBy={userId}
      />

      {/* TABLE */}
      <Table
      
          scroll={{ x: 'max-content' }}
        rowKey="_id"
        columns={columns}
        dataSource={announcements}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* EDIT MODAL */}
      <Modal
        title="Edit Announcement"
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModal(false)}>
            Cancel
          </Button>,
          <Button key="delete" danger onClick={deleteAnnouncement}>
            Delete
          </Button>,
          <Button key="save" type="primary" onClick={saveEdit}>
            Save
          </Button>,
        ]}
      >
        <label>Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <label>Content</label>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          style={{ marginBottom: 10 }}
        />

        <label>Audience</label>
        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          style={{ width: "100%", padding: 5 }}
        >
          <option value="All">All</option>
          <option value="Showroom">Showroom</option>
          <option value="Warehouse">Warehouse</option>
        </select>
      </Modal>

    </Card>
    
      <LeaveManager/>
    </div>
  );
};

export default AnnouncementsTable;
