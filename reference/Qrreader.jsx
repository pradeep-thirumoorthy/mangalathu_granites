import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRCodeScanner = () => {
  useEffect(() => {
    const onScanSuccess = (decodeText, decodeResult) => {
      alert("Your QR code is: " + decodeText);
    };

    const htmlScanner = new Html5QrcodeScanner(
      "my-qr-reader",
      { fps: 10, qrbox: 250 }
    );
    htmlScanner.render(onScanSuccess);

    return () => {
      htmlScanner.clear();
    };
  }, []);

  return (
    <div id="my-qr-reader"></div>
  );
};

export default QRCodeScanner;
