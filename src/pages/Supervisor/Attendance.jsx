import React, { useState } from "react";
import { Card, Button, Modal, Descriptions } from "antd";
import QRScanner from "./QrScanner";

import ShowroomClockInPanel from "./Attendance/flows/ShowroomClockInPanel";
import WarehouseClockInPanel from "./Attendance/flows/WarehouseClockInPanel";

import ShowroomClockOutPanel from "./Attendance/flows/ShowroomClockOutPanel";
import WarehouseClockOutPanel from "./Attendance/flows/WarehouseClockOutPanel";

const AttendanceTool = () => {
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const supervisorId = session?.user?.id;

  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "IN" | "OUT"
  console.log(scannedUser);
  const startScan = (type) => {
    setActionType(type);
    setScannedUser(null);
    setScannerVisible(true);
  };

  const handleScan = (userObj) => {
    setScannedUser(userObj);
    setScannerVisible(false);
  };

  const resetAll = () => {
    setScannedUser(null);
    setActionType("");
  };

  return (
    <Card title="Attendance Tool" style={{ maxWidth: 450, margin: "20px auto" }}>

      {/* STEP 1: Clock In / Clock Out buttons */}
      {!scannedUser && (
        <>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={() => startScan("IN")}
          >
            Clock-In
          </Button>

          <Button type="default" onClick={() => startScan("OUT")}>
            Clock-Out
          </Button>
        </>
      )}

      {/* STEP 2: QR Scanner */}
      <Modal
        title="Scan QR Code"
        open={scannerVisible}
        footer={null}
        onCancel={() => setScannerVisible(false)}
      >
        <QRScanner 
          onScan={handleScan} 
          actionType={actionType} 
        />
      </Modal>

      {/* STEP 3: After scanning, show employee details */}
      {scannedUser && (
        <Card size="small" style={{ marginTop: 20, marginBottom: 20 }}>
          <Descriptions title="Employee Details" bordered size="small" column={1}>
            <Descriptions.Item label="Name">
              {scannedUser.name}
            </Descriptions.Item>

            <Descriptions.Item label="Employee ID">
              {scannedUser.employeeId}
            </Descriptions.Item>

            <Descriptions.Item label="Department">
              {scannedUser.department}
            </Descriptions.Item>

            <Descriptions.Item label="Designation">
              {scannedUser.role}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* STEP 4: Decide CLOCK IN FLOW */}
      {scannedUser && actionType === "IN" && scannedUser.department === "Showroom" && (
        <ShowroomClockInPanel
          scannedUser={scannedUser}
          supervisorId={supervisorId}
          onDone={resetAll}
        />
      )}

      {scannedUser && actionType === "IN" && scannedUser.department === "Warehouse" && (
        <WarehouseClockInPanel
          scannedUser={scannedUser}
          supervisorId={supervisorId}
          onDone={resetAll}
        />
      )}

      {/* STEP 5: Decide CLOCK OUT FLOW */}
      {scannedUser && actionType === "OUT" && scannedUser.department === "Showroom" && (
        <ShowroomClockOutPanel
          scannedUser={scannedUser}
          supervisorId={supervisorId}
          onDone={resetAll}
        />
      )}

      {scannedUser && actionType === "OUT" && scannedUser.department === "Warehouse" && (
        <WarehouseClockOutPanel
          scannedUser={scannedUser}
          supervisorId={supervisorId}
          onDone={resetAll}
        />
      )}
    </Card>
  );
};

export default AttendanceTool;
