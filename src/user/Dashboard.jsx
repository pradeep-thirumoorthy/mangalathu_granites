import React from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Button } from "antd";
import { DollarOutlined, UserOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const Dashboard = () => {

  // Dummy Table Data
  const dataSource = [
    { key: '1', name: 'Order #1023', status: 'Completed', amount: '$250' },
    { key: '2', name: 'Order #1024', status: 'Pending', amount: '$120' },
    { key: '3', name: 'Order #1025', status: 'Cancelled', amount: '$80' }
  ];

  const columns = [
    { title: "Order", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { 
      title: "Action", 
    fixed: 'end',
      key: "action",
      render: () => <Button type="primary" size="small">View</Button>
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>

      {/* HEADER */}
      <Header style={{ 
            background:'inherit', 
    background: "inherit", padding: "10px 20px", fontSize: "20px", fontWeight: "bold" }}>
        Dashboard
      </Header>

      {/* CONTENT */}
      <Content style={{ margin: "20px" }}>

        {/* TOP CARDS */}
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={12600}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Statistic
                title="Active Users"
                value={328}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Statistic
                title="Orders"
                value={57}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* TABLE SECTION */}
        <Card title="Recent Orders" style={{ marginTop: "20px" }}>
          <Table
          scroll={{ x: 'max-content' }}
          
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        </Card>

      </Content>

      {/* FOOTER */}
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Dashboard - Static Template
      </Footer>

    </Layout>
  );
};

export default Dashboard;
