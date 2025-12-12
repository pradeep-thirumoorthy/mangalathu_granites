import React, { useState } from "react";
import { Button, message, Radio } from "antd";
import { showroomClockOut } from "./../AttendanceApi";

const ShowroomClockOutPanel = ({ scannedUser, supervisorId, onDone }) => {
  const [reason, setReason] = useState("");

  const isEarly = () => {
    const now = new Date();
    const fourPM = new Date();
    fourPM.setHours(16, 0, 0, 0);
    return now < fourPM;
  };

  const submit = async () => {
    try {
      await showroomClockOut(scannedUser.id, supervisorId, reason);
      message.success("Showroom Clock-Out Done");
      onDone();
    } catch (e) {
      message.error(e.message || "Clock-Out Failed");
    }
  };

  return (
    <div>
      <h3>Showroom Clock-Out</h3>
      <p>{scannedUser.firstName} {scannedUser.lastName}</p>

      {/* Early Leave Reason */}
      {isEarly() && (
        <div style={{ marginBottom: 15 }}>
          <Radio.Group
            onChange={(e) => setReason(e.target.value)}
            value={reason}
          >
            
            <Radio value="Present">Present</Radio>
            <Radio value="Leave Early">Leave Early</Radio>
            <Radio value="Permission">Permission</Radio>
            <Radio value="Half Day">Half Day</Radio>
          </Radio.Group>
        </div>
      )}

      <Button danger type="primary" onClick={submit}>
        Confirm Clock-Out
      </Button>
    </div>
  );
};

export default ShowroomClockOutPanel;
