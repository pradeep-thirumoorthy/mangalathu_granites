import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Input, Button, message } from 'antd';

const ShowOTPConfirm = ({email,setAcessButton}) => {
  const [otp, setOTP] = useState(null);
  const [inputOTP, setInputOTP] = useState('');
  const [visible, setVisible] = useState(false);
  const handleOk = () => {
    try {
      const parsedInputOTP = parseInt(inputOTP, 10);
      if (parsedInputOTP === otp) {
        console.log('OTP verified');
        setVisible(false);
        message.success('OTP verified!');
        setOTP(null);
        setAcessButton(true);
      } else {
        console.log('Invalid OTP');
        message.error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while verifying OTP');
    }
  };
  

  const handleOTP = async () => {
    try {
      const response = await axios.get('https://studio-backend-sigma.vercel.app/user/otp', { params: { email } });
      if (response.data.success) {
        setOTP(response.data.otp);
        setVisible(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const isInputOTPLengthValid = inputOTP.length === 6;
  return (
    <>
      <button onClick={handleOTP} className='border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'>Request OTP</button>
      <Modal
        title="Enter OTP"
        open={visible}
        onOk={handleOk}
        closable={false}
        footer={[
            <Button key="verify" onClick={handleOk} disabled={!isInputOTPLengthValid}>
              Verify
            </Button>,
          ]}
      >
        <Input
          placeholder="Enter OTP"
          value={inputOTP}
          onChange={(e) => setInputOTP(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ShowOTPConfirm;
