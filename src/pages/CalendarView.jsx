import React, { useEffect, useState } from "react";
import { Calendar, Modal, List, Tag } from "antd";
import axios from "axios";
import moment from "moment";

const EmployeeCalendarView = () => {
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const userId = session?.user?.id;

  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch employee schedules
  const fetchMySchedules = async () => {
    try {
      if (!userId) return;

      const res = await axios.get(`http://localhost:3010/calendar/view/${userId}`);

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
      console.error("Failed to fetch schedules:", err);
    }
  };

  useEffect(() => {
    fetchMySchedules();
  }, [userId]);

  // Open modal when date clicked
  const handleDateSelect = (value) => {
    setSelectedDate(value);
    setModalVisible(true);
  };

  // Render events on calendar date
  const dateCellRender = (value) => {
    const key = value.format("YYYY-MM-DD");
    const list = events[key] || [];

    return (
      <div
        onClick={() => handleDateSelect(value)}
        style={{
          minHeight: 60,
          padding: 4,
          cursor: "pointer",
        }}
      >
        {list.length > 0 && (
          <List
            size="small"
            dataSource={list}
            renderItem={(event) => (
              <List.Item style={{ padding: "2px 0" }}>
                <Tag color="blue" style={{ fontSize: 11 }}>
                  {event.startTime}-{event.endTime}
                </Tag>
                {event.title}
              </List.Item>
            )}
          />
        )}

        {list.length === 0 && (
          <span style={{ color: "#aaa", fontSize: 10 }}>No tasks</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px" }}>
          <Calendar dateCellRender={dateCellRender} />
        </div>
      </div>

      {/* View Events Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        title={`Your Tasks on ${selectedDate?.format("YYYY-MM-DD")}`}
        footer={null}
      >
        <List
          dataSource={events[selectedDate?.format("YYYY-MM-DD")] || []}
          locale={{ emptyText: "No tasks on this day" }}
          renderItem={(event) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <>
                    <Tag color="blue">
                      {event.startTime} - {event.endTime}
                    </Tag>
                    {event.title}
                  </>
                }
                description={<div>{event.description}</div>}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default EmployeeCalendarView;
