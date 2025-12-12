import React from "react";
import { Button, message } from "antd";
import { showroomClockIn,} from "../AttendanceApi";

const ClockInPanel = ({ scannedUser, supervisorId, onDone }) => {

  const submit = async () => {
    try {
      console.log("Submitting clock-in:", {
        userId: scannedUser.id,
        supervisorId,
        timestamp: new Date().toISOString(),
      });

      await showroomClockIn(scannedUser.id, supervisorId);

      message.success("Clock-In Recorded");
      onDone(); // Reset parent state after successful submission
    } catch (err) {
      console.error("Clock-In error:", err);
      message.error("Clock-In Failed");
    }
  };

  return (
    <div>
      <h3>Clock-In</h3>
      <p><b>Name:</b> {scannedUser.firstName} {scannedUser.lastName}</p>
      <p><b>Department:</b> {scannedUser.department}</p>
      <p><b>Role:</b> {scannedUser.role}</p>

      <Button type="primary" onClick={submit}>Confirm Clock-In</Button>
    </div>
  );
};

export default ClockInPanel;
