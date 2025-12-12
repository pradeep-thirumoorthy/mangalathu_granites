import React, { useEffect, useState } from "react";
import { Button, message, List, Radio, Divider } from "antd";
import { warehouseClockIn } from "../AttendanceApi";
import axios from "axios";
import moment from "moment";

const WarehouseClockInPanel = ({ scannedUser, supervisorId, onDone }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const today = moment().format("YYYY-MM-DD");
  const currentTime = moment().format("HH:mm");

  // Fetch today's schedules for the user
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3010/calendar/user/${scannedUser.id}/${today}`
      );

      if (res.data.success) {
        setSchedules(res.data.data || []);
      }
    } catch (err) {
      console.error("Schedule fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const submit = async () => {
    try {
      const payload = {
        userId: scannedUser.id,
        supervisorId,
        scheduleId: selectedSchedule, // selected schedule
        date: today,
        time: currentTime
      };

      console.log("Payload:", payload);

      await warehouseClockIn(payload);

      message.success("Clock-In Successful");
      onDone();
    } catch (err) {
      console.error("Clock-In error:", err);
      message.error("Clock-In Failed");
    }
  };

  return (
    <div>
      <h3>Clock-In</h3>

      <p><b>Name:</b> {scannedUser.name}</p>
      <p><b>Department:</b> {scannedUser.department}</p>
      <p><b>Role:</b> {scannedUser.role}</p>

      <Divider />
      <h4>Today's Schedules</h4>

      {schedules.length === 0 ? (
        <p style={{ color: "red" }}>No schedules available for today.</p>
      ) : (
        <Radio.Group
          style={{ width: "100%" }}
          onChange={(e) => setSelectedSchedule(e.target.value)}
        >
          <List
            bordered
            size="small"
            dataSource={schedules}
            renderItem={(item) => (
              <List.Item>
                <Radio value={item._id}>
                  <b>{item.title}</b> ({item.startTime} - {item.endTime})
                </Radio>
              </List.Item>
            )}
          />
        </Radio.Group>
      )}

      <Divider />

      <Button
        type="primary"
        onClick={submit}
        disabled={schedules.length > 0 && !selectedSchedule}
      >
        Confirm Clock-In
      </Button>
    </div>
  );
};

export default WarehouseClockInPanel;
