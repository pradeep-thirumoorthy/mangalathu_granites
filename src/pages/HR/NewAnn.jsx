import React, { useState } from "react";
import { Modal, Input, message } from "antd";

const { TextArea } = Input;

const NewAnnouncementModal = ({ open, onClose, onCreated, postedBy }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setTitle("");
    setContent("");
    setTargetAudience("All");
  };

  const saveAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Title and Content cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3010/ann", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          targetAudience,
          postedBy, // userId passed from parent
        }),
      });

      const data = await res.json();

      if (data.success) {
        message.success("Announcement added successfully");
        resetFields();
        onCreated(); // refresh parent table
        onClose();   // close modal
      } else {
        message.error(data.message || "Failed to create announcement");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Announcement"
      open={open}
      onCancel={onClose}
      okText="Create"
      confirmLoading={loading}
      onOk={saveAnnouncement}
    >
      <label>Title</label>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: 10 }}
        placeholder="Enter announcement title"
      />

      <label>Content</label>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        style={{ marginBottom: 10 }}
        placeholder="Write announcement content"
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
  );
};

export default NewAnnouncementModal;
