import React from "react";
import { Layout, Card, Timeline, Table, Typography } from "antd";
import {
  ClockCircleOutlined,
  SafetyOutlined,
  FileDoneOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const WageWorkersTimeline = () => {
  // Dummy table data for tasks or shifts
  const tasksData = [
    { key: "1", task: "Tile Loading", hours: 4 },
    { key: "2", task: "Warehouse Cleaning", hours: 2 },
    { key: "3", task: "Inventory Check", hours: 3 },
  ];

  const tasksColumns = [
    { title: "Task", dataIndex: "task", key: "task" },
    { title: "Hours Allocated", dataIndex: "hours", key: "hours" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "20px" }}>
        <Card title="Wage Workers Shift Instructions">
          <Timeline mode="alternate">
            <Timeline.Item
              dot={<ClockCircleOutlined style={{ fontSize: 40, color: "#1890ff" }} />}
            >
              <Title level={4}>Clock-In Procedure</Title>
              <Paragraph style={{ fontSize: 16 }}>
                All wage workers must clock in at the start of the shift using the designated terminal.
                Verify that the time is recorded correctly and confirm your identity.
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item
              dot={<SafetyOutlined style={{ fontSize: 40, color: "red" }} />}
            >
              <Title level={4}>Safety Compliance</Title>
              <Paragraph style={{ fontSize: 16 }}>
                Wear appropriate safety gear at all times. Follow warehouse safety rules, ensure proper
                lifting techniques, and keep walkways clear of obstacles.
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item
              dot={<FileDoneOutlined style={{ fontSize: 40, color: "#faad14" }} />}
            >
              <Title level={4}>Task Assignments</Title>
              <Paragraph style={{ fontSize: 16 }}>
                Follow assigned daily tasks carefully. Record hours spent on each task for management review.
              </Paragraph>
              <Table
                dataSource={tasksData}
                columns={tasksColumns}
                pagination={false}
                size="middle"
                bordered
                style={{ marginTop: 10 }}
              />
            </Timeline.Item>

            <Timeline.Item
              dot={<DollarOutlined style={{ fontSize: 40, color: "green" }} />}
            >
              <Title level={4}>Overtime Management</Title>
              <Paragraph style={{ fontSize: 16 }}>
                Overtime hours should be recorded accurately. Confirm that overtime is pre-approved
                and entered in the system before payroll calculation.
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item
              dot={<CheckCircleOutlined style={{ fontSize: 40, color: "purple" }} />}
            >
              <Title level={4}>End-of-Shift Clock-Out</Title>
              <Paragraph style={{ fontSize: 16 }}>
                Clock out at the end of your shift. Verify that the clock-out time is recorded. Report any discrepancies to the supervisor immediately.
              </Paragraph>
            </Timeline.Item>

            <Timeline.Item
              dot={<CheckCircleOutlined style={{ fontSize: 40, color: "orange" }} />}
            >
              <Title level={4}>Shift Reporting</Title>
              <Paragraph style={{ fontSize: 16 }}>
                Submit daily reports of completed tasks, total hours worked, and overtime hours.
                Ensure all information is accurate for payroll processing.
              </Paragraph>
            </Timeline.Item>
          </Timeline>
        </Card>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Warehouse Dashboard - Wage Workers Instructions
      </Footer>
    </Layout>
  );
};

export default WageWorkersTimeline;
