import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message, Divider,Select } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
const { Title, Text, Link } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
  setLoading(true);
  console.log("Form Submitted:", values);

  try {
    const response = await fetch("http://localhost:3010/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    // Store in sessionStorage
    sessionStorage.setItem("userData", JSON.stringify(data));
    console.log(values.type)
    message.success("Login successful!");
    
    // Optional: navigate to dashboard after success
    setTimeout(() => {
      navigate(`/${values.type}`);
    }, 800);

  } catch (error) {
    console.error("Login Error:", error.message);
    message.error("Login failed. Check credentials or server.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={styles.header}>
          <Title level={3}>Welcome Back</Title>
          <Text type="secondary">Please enter your details to sign in.</Text>
        </div>

        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Email / Username Field */}
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="Username or Email" 
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item name="type" rules={[{ required: true, message: 'Please select a role!' }]}>
           <Select placeholder="Select Role"
            options={[
      { label: 'Owner', value: 'Owner' },
      { label: 'HR', value: 'HR' },
      { label: 'Warehouse Supervisor', value: 'Warehouse_Supervisor' },
      { label: 'Sales Supervisor', value: 'Showroom_Supervisor' },
      { label: 'Sales Executives', value: 'Sales_Executive' },
      { label: 'Warehouse Worker', value: 'Warehouse_Worker' },]}/>
      </Form.Item>

          {/* Remember Me & Forgot Password Row */}
          <Form.Item>
            <div style={styles.flexBetween}>
              <Form.Item  valuePropName="" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              {/* Link to the Forget component created earlier */}
              <a className="login-form-forgot" href="/forgetpassword">
                Forgot password?
              </a>
            </div>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
              Log in
            </Button>
          </Form.Item>

          {/* Optional: Social Login or Register */}
          {/* <Divider plain>Or</Divider>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? <a href="/register">Sign up now</a></Text>
          </div> */}
        </Form>
      </Card>
    </div>
  );
};

// Consistent styles with the Forget component
const styles = {
  container: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
 background: 'radial-gradient(circle, #7fb8ef 0%, #ffffff 120%)'

},  
  card: {
    width: 400,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
};

export default Login;