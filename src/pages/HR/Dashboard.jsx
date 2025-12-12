import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Spin,Button } from "antd";
import { Pie, Column, Line } from "@ant-design/plots";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { theme } from "antd";

const { Header, Content } = Layout;

const HRDashboard = () => {

  
const { token } = theme.useToken();


  const navigate=useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    employeesByDept: [],
    attendanceTrend: [],
    avgAttendance: 0,
    payrollThisMonthTotal: 0,
    payrollChart: [],
    grievancesByStatus: {},
    recentGrievances: [],
    recentNotices: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3010/dashboard/summary");
        setStats(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spin style={{ width: "100%", marginTop: "50px" }} size="large" />;

  // Transform department data for Pie chart
  const deptChartData = stats.employeesByDept.map(d => ({
    type: d.department,
    value: d.count,
  }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{
    background: "inherit",fontWeight: "bold", fontSize: 20 }}>
        HR Dashboard
      </Header>

      <Content style={{ padding: 20 }}>
        {/* Top Stats */}
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={6}>
    <Card title="Total Active Employees">{stats.totalEmployees}</Card>
  </Col>

  <Col xs={24} sm={12} md={6}>
    <Card title="Avg Attendance">{stats.avgAttendance}%</Card>
  </Col>

  <Col xs={24} sm={12} md={6}>
    <Card title="Payroll This Month">${stats.payrollThisMonthTotal}</Card>
  </Col>

  <Col xs={24} sm={12} md={6}>
    <Card title="Open Grievances">
      {stats.grievancesByStatus?.Open || 0}
    </Card>
  </Col>
</Row>


        {/* Department Breakdown */}
<Row gutter={[16, 16]} style={{ marginTop: 20 }}>
  <Col xs={24} md={12}>
    <Card title="Department Breakdown">
      {deptChartData.length > 0 ? (
        <Pie
          data={deptChartData}
          angleField="value"
          colorField="type"
          height={300}
        />
      ) : "No Data"}
    </Card>
  </Col>

  <Col xs={24} md={12}>
    <Card title="Payroll Last 6 Months">
      {stats.payrollChart.length > 0 ? (
        <Column
          data={stats.payrollChart.map(p => ({ month: p.month, total: p.total }))}
          xField="month"
          yField="total"
          height={300}
        />
      ) : "No Data"}
    </Card>
  </Col>
</Row>


        {/* Attendance Trend */}
<Row gutter={[16, 16]} style={{ marginTop: 20 }}>
  <Col xs={24}>
    <Card title="Attendance Trend" style={{ height: "300px" }}>
      <div style={{ height: 300 }}>
        {stats.attendanceTrend.length > 0 ? (
          <Line
            data={stats.attendanceTrend}
            xField="date"
            yField="present"
            height={200}
            smooth
          />
        ) : "No Data"}
      </div>
    </Card>
  </Col>
</Row>


        {/* Recent Notices */}
<Row gutter={[16, 16]} style={{ marginTop: 20 }}>
  <Col xs={24} md={12}>
    <Card
      title="Recent Notices"
      extra={<Button type="primary" onClick={() => navigate("/HRannouncements")}>Add New</Button>}
    >
      <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
        {stats.recentNotices.length > 0
          ? stats.recentNotices.map(n => (
              <div key={n._id} style={{ marginBottom: 12, paddingBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{n.title}</strong>
                  <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                </div>
                <div style={{ fontSize: 12 }}>{n.content}</div>
              </div>
            ))
          : "No Data"}
      </div>
    </Card>
  </Col>

  <Col xs={24} md={12}>
    <Card
      title="Recent Grievances"
      extra={<Button type="link" onClick={() => navigate("/HRgrievances")}>View All</Button>}
    >
      <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
        {stats.recentGrievances.length > 0
          ? stats.recentGrievances.map(g => (
              <div key={g._id} style={{ marginBottom: 12, paddingBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{g.description}</strong>
                  <small>{new Date(g.createdAt).toLocaleDateString()}</small>
                </div>
                <div style={{ fontSize: 12 }}>Status: {g.status}</div>
              </div>
            ))
          : "No Data"}
      </div>
    </Card>
  </Col>
</Row>

      </Content>
    </Layout>
  );
};

export default HRDashboard;
