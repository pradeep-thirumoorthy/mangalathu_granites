import React, { useEffect, useState } from "react";
import { Calendar, Modal, Button, Input, List, Checkbox, message, Tag } from "antd";
import axios from "axios";
import moment from "moment";

const Roaster = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [events, setEvents] = useState({});
  const [employees, setEmployees] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:3010/calendar");
      if (res.data.success) {
        const grouped = {};
        res.data.data.forEach((event) => {
          const key = moment(event.date).format("YYYY-MM-DD");
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(event);
        });
        setEvents(grouped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3010/calendar/workers/warehouse");
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
  }, []);

  const handleDateClick = (value) => {
    setSelectedDate(value);
    setModalVisible(true);
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setSelectedEmployees([]);
  };

  const handleSaveSchedule = async () => {
    if (!title || !startTime || !endTime || selectedEmployees.length === 0) {
      return message.error("Fill all fields and select at least one employee");
    }

    const date = selectedDate.format("YYYY-MM-DD");

    try {
      if (editingEventId) {
        await axios.put(`http://localhost:3010/calendar/update/${editingEventId}`, {
          userIds: selectedEmployees,
          title,
          description,
          startTime,
          endTime,
          date,
        });
        message.success("Schedule updated successfully");
      } else {
        await axios.post("http://localhost:3010/calendar", {
          userIds: selectedEmployees,
          title,
          description,
          startTime,
          endTime,
          date,
        });
        message.success("Schedule added successfully");
      }

      setAddModalVisible(false);
      setModalVisible(false);
      setEditingEventId(null);
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setSelectedEmployees([]);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      message.error("Failed to save schedule");
    }
  };

  const handleEditSchedule = (event) => {
    setEditingEventId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setSelectedEmployees(event.userIds.map((u) => u._id));
    setAddModalVisible(true);
  };

  const dateCellRender = (value) => {
    const key = value.format("YYYY-MM-DD");
    const list = events[key] || [];
    return (
      <div style={{ minHeight: 80, padding: 4 }}>
        {list.map((event) => (
          <div key={event._id} style={{ fontSize: 11, marginBottom: 2 }}>
            <Tag color="blue" style={{ fontSize: 10 }}>
              {event.startTime} - {event.endTime}
            </Tag>{" "}
            {event.title}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Outer wrapper makes the calendar scrollable if it overflows */}
      <div
        style={{
          width: "100%",
          height: "80vh", // Fixed height for the calendar
          overflow: "auto", // enable both horizontal and vertical scroll
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Inner wrapper to prevent shrinking */}
        <div style={{ minWidth: "1200px", minHeight: "100%" }}>
          <Calendar fullscreen={false} dateCellRender={dateCellRender} />
        </div>
      </div>

      {/* Schedule Details Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={`Schedules on ${selectedDate?.format("YYYY-MM-DD")}`}
        footer={[
          <Button key="add" onClick={() => setAddModalVisible(true)}>
            Add Schedule
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedDate && (
          <List
            dataSource={events[selectedDate.format("YYYY-MM-DD")] || []}
            locale={{ emptyText: "No events for this date" }}
            renderItem={(event) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => handleEditSchedule(event)}>
                    Edit
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`${event.startTime} - ${event.endTime}: ${event.title}`}
                  description={<small>{event.description}</small>}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Add/Edit Schedule Modal */}
      <Modal
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        title={editingEventId ? "Edit Schedule" : "Add Schedule"}
        footer={[
          <Button onClick={() => setAddModalVisible(false)}>Cancel</Button>,
          <Button type="primary" onClick={handleSaveSchedule}>
            Save
          </Button>,
        ]}
      >
        <Input
          placeholder="Work Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Start Time (HH:MM)"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="End Time (HH:MM)"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <p><b>Select Employees:</b></p>
        <Checkbox.Group
          style={{ width: "100%" }}
          value={selectedEmployees}
          onChange={setSelectedEmployees}
        >
          {employees.map((emp) => (
            <Checkbox key={emp._id} value={emp._id}>
              {emp.firstName} {emp.lastName}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </>
  );
};

export default Roaster;
