import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Statistic, Table, Timeline, Spin } from "antd";
import { UserOutlined, DollarOutlined, TeamOutlined, FileTextOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const { Content, Footer } = Layout;

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3010/dashboard/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  }

  // --- Tables ---
  const deptColumns = [
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Employees", dataIndex: "employees", key: "employees" },
    { title: "Revenue (₹)", dataIndex: "revenue", key: "revenue", render: val => val.toLocaleString() },
    { title: "Avg Salary (₹)", dataIndex: "avgSalary", key: "avgSalary", render: val => val.toLocaleString() }
  ];

  const grievancesColumns = [
    { title: "Employee", key: "employee", render: (_, r) => r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : "Anonymous" },
    { title: "Role", key: "role", render: (_, r) => r.userId?.role || "N/A" },
    { title: "Issue", dataIndex: "category", key: "issue" },
    { title: "Status", dataIndex: "status", key: "status" }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: 20 }}>

        {/* KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic title="Total Employees" value={data.totalEmployees} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Active Employees" value={data.activeEmployees} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Payroll This Month" value={data.payrollThisMonth} prefix={<DollarOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Pending Grievances" value={Object.values(data.grievancesByStatus).reduce((a,b)=>a+b,0)} prefix={<FileTextOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* Attendance Today */}
        <Row gutter={[16,16]} style={{ marginTop: 20 }}>
          <Col span={12}>
            <Card title="Attendance Today">
              <Row>
                <Col span={12}><Statistic title="Present" value={data.attendanceToday.present} /></Col>
                <Col span={12}><Statistic title="Absent" value={data.attendanceToday.absent} /></Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Attendance Trend (Last 14 Days)">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.attendanceTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="present" stroke="#1890ff" name="Present" />
                  <Line type="monotone" dataKey="total" stroke="#52c41a" name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Payroll Trend */}
        <Card title="Payroll Trend (Last 6 Months)" style={{ marginTop: 20 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.payrollChart}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={val => `₹${val.toLocaleString()}`} />
              <Line type="monotone" dataKey="total" stroke="#fa8c16" name="Net Salary Paid" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Performance Table */}
        <Card title="Department Performance" style={{ marginTop: 20 }}>
          <Table columns={deptColumns} dataSource={data.departmentPerformance} rowKey="department" pagination={false} />
        </Card>

        {/* Recent Grievances Table */}
        <Card title="Recent Grievances" style={{ marginTop: 20 }}>
          <Table columns={grievancesColumns} dataSource={data.recentGrievances} rowKey={r => r._id} pagination={false} />
        </Card>

        {/* Notices Timeline */}
        <Card title="Recent Notices" style={{ marginTop: 20 }}>
          <Timeline mode="alternate">
            {data.recentNotices.map(notice => (
              <Timeline.Item key={notice._id}>
                <Card size="small" title={notice.title}>
                  <p>{notice.content}</p>
                  <small>{new Date(notice.createdAt).toLocaleString()}</small>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

      </Content>
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Analytics Dashboard
      </Footer>
    </Layout>
  );
};

export default AnalyticsDashboard;
