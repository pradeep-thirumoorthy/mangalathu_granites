import React, { useState } from "react";
import { Button, message, Radio, InputNumber } from "antd";
import { warehouseClockOut } from "./../AttendanceApi";

const WarehouseClockOutPanel = ({ scannedUser, supervisorId, onDone }) => {
  const [reason, setReason] = useState("");
  const [overtime, setOvertime] = useState(0);

  // Early leave check (before 5 PM)
  const isEarly = () => {
    const now = new Date();
    const fivePM = new Date();
    fivePM.setHours(17, 0, 0, 0);
    return now < fivePM;
  };

  const submit = async () => {
    try {
      await warehouseClockOut(scannedUser.id, supervisorId, reason, overtime);

      message.success("Warehouse Clock-Out Successful");
      onDone();
    } catch (err) {
      message.error(err.message || "Clock-Out Failed");
    }
  };

  return (
    <div>
      <h3>Warehouse Clock-Out</h3>
      <p>
        {scannedUser.firstName} {scannedUser.lastName}
      </p>

      {/* Early Leave Reasons */}
      {isEarly() && (
        <div style={{ marginBottom: 15 }}>
          <p><b>Reason (early leave):</b></p>

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

      {/* Overtime Input */}
      <div style={{ marginTop: 15, marginBottom: 20 }}>
        <p><b>Overtime Hours:</b></p>

        <InputNumber
          min={0}
          max={12}
          value={overtime}
          onChange={(v) => setOvertime(v)}
          style={{ width: "120px" }}
        />
      </div>

      <Button type="primary" danger onClick={submit}>
        Confirm Clock-Out
      </Button>
    </div>
  );
};

export default WarehouseClockOutPanel;
