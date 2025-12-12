import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { Button, message } from 'antd';

const QRCodeScanner = ({ order }) => {
  const [showScanner, setShowScanner] = useState(false);
const htmlScanner = new Html5QrcodeScanner(
      "my-qr-reader",
      { fps: 10, qrbox: 250 }
    );
  useEffect(() => {
    

    const onScanSuccess = (decodeText, decodeResult) => {
      console.log({decodeText,type:typeof(decodeText)});
      
      if (decodeText.startsWith('https://new-bharani-digital-studio.vercel.app/user/Product/qrcode/')) {
        console.log('URL is found');
        
        axios.post(decodeText, { orderId: order._id }, { withCredentials: true }) // Include orderId and withCredentials true
          .then(response => {
            console.log('Post request successful:', response.data);
            message.success('Status Updated');
            window.location.reload();
          })
          .catch(error => {
            message.error(error.response.data.message);
            console.error('Error making post request:', error.response.data.message);
          });
      }
    };

    if (showScanner) {
      htmlScanner.render(onScanSuccess);
    } else {
      htmlScanner.clear();
    }

    return () => {
      htmlScanner.clear();
    };
  }, [showScanner, order]);

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  return (
    <>
      {!showScanner && (
        <Button onClick={handleOpenScanner}>Open QR Reader</Button>
      )}
        <div id="my-qr-reader"></div>
    </>
  );
};

export default QRCodeScanner;
