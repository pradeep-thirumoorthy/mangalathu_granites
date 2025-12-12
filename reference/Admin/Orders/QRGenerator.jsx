import { QRCode, Space, Button } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const QRGenerator = ({ order }) => {
  const [text, setText] = useState(""); // State to hold the QR code text

  const downloadQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = 'QRCode.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://studio-backend-sigma.vercel.app/admin/Product/qrcode`,
          {
            params: {
              orderId: order._id,
            },
            withCredentials: true,
          }
        );
        console.log(response.data.qrCodeUrl);
        setText(response.data.qrCodeUrl);
      } catch (error) {
        console.error("Error fetching QR code data:", error);
      }
    };

    if (order) {
      fetchData();
    }
  }, [order]);

  return (
    <>
      <Space direction="vertical" align="center">
        <div id="myqrcode">
          <QRCode value={text || "-"} />
        </div>
        <Button onClick={downloadQRCode}>
          Download QR Code
        </Button>
      </Space>
    </>
  );
};

export default QRGenerator;
