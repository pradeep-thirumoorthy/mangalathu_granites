import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Forget = () => {
  const [loading, setLoading] = useState(false);

  // Triggered when the form passes validation
  const onFinish = (values) => {
    setLoading(true);
    console.log('Success:', values);

    // TODO: Replace with your actual API call
    setTimeout(() => {
      setLoading(false);
      message.success('Password reset link sent to your email!');
    }, 1500); // Simulating a network delay
  };

  // Triggered if validation fails
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please enter a valid email.');
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={styles.header}>
          <Title level={3}>Forgot Password?</Title>
          <Text type="secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </div>

        <Form
          name="forget_password"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'The input is not valid E-mail!' },
            ]}
          >
            <Input 
              prefix={<MailOutlined className="site-form-item-icon" />} 
              placeholder="Enter your email" 
              size="large" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
            >
              Send Reset Link
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Remember your password? <a href="/login">Login</a></Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

// Basic layout styles to center the card
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Standard Ant Design background color
  },
  card: {
    width: 400,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  }
};

export default Forget;