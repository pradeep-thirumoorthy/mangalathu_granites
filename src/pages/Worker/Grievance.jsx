import React, { useState, useEffect } from "react";
import { Form, Input, Select, Switch, Button, message, Card, Table, Row, Col } from "antd";
import axios from "axios";

const { TextArea } = Input;

const GrievanceForm = () => {
  const [loading, setLoading] = useState(false);
  const [myGrievances, setMyGrievances] = useState([]);

  const session = JSON.parse(sessionStorage.getItem("userData"));
  const userId = session?.user?.id || "";

  // 🔥 Load grievances for this user
  const loadMyGrievances = async () => {
    try {
      const res = await axios.get(`http://localhost:3010/grievance/user/${userId}`);
      if (res.data.success) {
        setMyGrievances(res.data.data);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load grievances");
    }
  };

  useEffect(() => {
    if (userId) loadMyGrievances();
  }, [userId]);

  // 🔥 Submit grievance
  const submitForm = async (values) => {
    try {
      setLoading(true);

      const payload = {
        userId: userId,
        isAnonymous: values.isAnonymous || false,
        category: values.category,
        description: values.description,
      };

      const res = await axios.post("http://localhost:3010/grievance/create", payload);

      if (res.data.success) {
        message.success("Grievance submitted! Ticket ID: " + res.data.ticketId);

        // refresh table immediately
        loadMyGrievances();
      } else {
        message.error(res.data.message || "Failed to submit");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Table columns
  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text) => text.slice(0, 50) + "...",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => s || "Pending",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
  {/* LEFT: FORM */}
  <Col xs={24} sm={24} md={12} lg={12}>
    <Card title="Submit Grievance">
      <Form layout="vertical" onFinish={submitForm}>

        <Form.Item label="Submit Anonymously" name="isAnonymous" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Category" name="category" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="Safety">Safety</Select.Option>
            <Select.Option value="Harassment">Harassment</Select.Option>
            <Select.Option value="Salary">Salary</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <TextArea rows={5} placeholder="Explain the issue clearly..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Submit
        </Button>

      </Form>
    </Card>
  </Col>

  {/* RIGHT: TABLE */}
  <Col xs={24} sm={24} md={12} lg={12}>
    <Card title="My Grievances">
      <Table
        scroll={{ x: 'max-content' }}
        dataSource={myGrievances}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  </Col>
</Row>

  );
};

export default GrievanceForm;
