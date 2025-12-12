import React, { useState } from "react";
import CameraAccessGate from "./ShowroomDashboard";

const ShowroomDashboard = () => {
  const [cameraAllowed, setCameraAllowed] = useState(false);

  return (
    <>
      {!cameraAllowed && (
        <CameraAccessGate
          onAllow={() => setCameraAllowed(true)}
        />
      )}

      {cameraAllowed && (
        <div>
          {/* Your real page content here */}
          <h2>Camera Allowed</h2>
        </div>
      )}
    </>
  );
};

export default ShowroomDashboard;
