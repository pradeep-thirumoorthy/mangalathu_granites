import React from "react";
import { Layout, Card, Row, Col, Table, Typography } from "antd";
import { InfoCircleOutlined, CheckCircleOutlined, ShoppingOutlined, FileDoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const SalesInstructionsCards = () => {

  // Dummy table data for showroom tiles
  const tilesData = [
    { key: "1", tile: "Marble Tile A", size: "2x2 ft", price: "$15/sq ft" },
    { key: "2", tile: "Granite Tile B", size: "3x3 ft", price: "$20/sq ft" },
    { key: "3", tile: "Ceramic Tile C", size: "2x3 ft", price: "$12/sq ft" },
  ];

  const tilesColumns = [
    { title: "Tile Name", dataIndex: "tile", key: "tile" },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Price", dataIndex: "price", key: "price" },
  ];

  // Instruction steps
  const steps = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: 40, color: 'green' }} />,
      title: "Showroom Opening",
      content: "Open the showroom at least 15 minutes before official hours. Ensure all displays are clean and well-lit. Check that promotional materials are correctly placed."
    },
    {
      icon: <ShoppingOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      title: "Inventory Check",
      content: <>
        Verify stock levels for all tile categories. Confirm quantities for each type and check for any damages. Maintain an updated record for management review.
        <Table
          dataSource={tilesData}
          columns={tilesColumns}
          pagination={false}
          size="middle"
          bordered
          style={{ marginTop: 10 }}
        />
      </>
    },
    {
      icon: <FileDoneOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      title: "Customer Assistance",
      content: "Greet customers promptly. Assist them in choosing tiles based on size, material, price, and design. Provide product recommendations and highlight promotions."
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 40, color: '#eb2f96' }} />,
      title: "Safety & Floor Maintenance",
      content: "Maintain showroom floor layout and ensure walkways are safe. Remove any obstacles or hazards and ensure tiles are displayed securely."
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 40, color: 'purple' }} />,
      title: "Sales Recording",
      content: "Record all transactions in the POS system accurately. Verify totals and provide receipts to customers. Track any returns or pending payments."
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 40, color: 'orange' }} />,
      title: "Showroom Closing",
      content: "Close the showroom securely. Store tiles and equipment properly. Update daily reports and ensure the premises are clean."
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
        <Row gutter={[20, 20]}>
          {steps.map((step, idx) => (
            <Col xs={24} md={12} lg={8} key={idx}>
              <Card
                hoverable
                style={{ minHeight: 300, textAlign: "center" }}
                cover={<div style={{ margin: '20px 0' }}>{step.icon}</div>}
              >
                <Title level={4}>{step.title}</Title>
                <Paragraph style={{ fontSize: 16 }}>{step.content}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Showroom Dashboard - Sales Executive Instructions
      </Footer>
    </Layout>
  );
};

export default SalesInstructionsCards;
