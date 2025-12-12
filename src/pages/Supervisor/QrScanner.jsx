import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { message } from "antd";
import axios from "axios";

/**
 * QRScanner Component
 *
 * Props:
 * - videoWidth, videoHeight: Dimensions for the <video> element
 * - onScan: Callback after successful scan & validation
 * - actionType: "clock-in" | "clock-out" | null (sent to API)
 */
const QRScanner = ({
  videoWidth = 400,
  videoHeight = 300,
  onScan,
  actionType = null,
}) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const session = JSON.parse(sessionStorage.getItem("userData"));
  const userDepartment = session?.user?.department || "";
  const supervisorId = session?.user?.id || "";
  const employeeId = session?.user?.employeeId || "";

  // API endpoint to validate scanned QR
  const validateScanAPI = async (scanned) => {
    try {
      const res = await axios.post("http://localhost:3010/att/super/validate-scan", {
        employeeId: scanned.id, // employee ID from scanned QR
        supervisorId,
        type: actionType,       // clock-in or clock-out
        });

      return res.data?.allowed === true;
    } catch (e) {
      console.error("API Error:", e);
      message.error("Server validation failed");
      return false;
    }
  };

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const devices = await codeReaderRef.current.listVideoInputDevices();
        if (!devices.length) {
          message.error("No camera detected");
          return;
        }

        const deviceId = devices[0].deviceId;

        // Ensure video plays
        videoRef.current.onloadedmetadata = () => videoRef.current.play();

        // Start scanning
        codeReaderRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          async (result, err) => {
            if (!result) return;

            if (isProcessing) return;
            setIsProcessing(true);

            try {
              const scanned = JSON.parse(result.getText());

              // 1️⃣ Department check
              if (scanned.department !== userDepartment) {
                message.warning(
                  `Department mismatch — expected: ${userDepartment}, scanned: ${scanned.department}`
                );
                setIsProcessing(false);
                return;
              }

              // 2️⃣ Validate with API
              const allowed = await validateScanAPI(scanned);

              if (!allowed) {
                message.error("Scan rejected — API validation failed");
                setIsProcessing(false);
                return;
              }

              // 3️⃣ Pass validated object to parent
              if (onScan) onScan(scanned);

              message.success("Scan accepted!");
            } catch (e) {
              console.error("Invalid QR format:", e);
              message.error("Invalid QR format");
            }

            // Cooldown before allowing another scan
            setTimeout(() => setIsProcessing(false), 1500);
          }
        );
      } catch (e) {
        console.error(e);
        message.error("Camera access failed");
      }
    };

    startScanner();

    return () => {
      codeReaderRef.current?.reset();
    };
  }, [userDepartment, onScan, supervisorId, actionType]);

  return (
    <div>
      <video
        ref={videoRef}
        style={{
          width: videoWidth,
          height: videoHeight,
          border: "1px solid #000",
          borderRadius: 6,
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default QRScanner;
