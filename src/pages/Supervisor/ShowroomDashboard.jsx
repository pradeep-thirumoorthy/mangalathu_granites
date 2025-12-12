import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Spin, Button } from "antd";
import { Pie, Line } from "@ant-design/plots";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const session = JSON.parse(sessionStorage.getItem("userData"));
  const supervisorId = session?.user?.id;

  const [stats, setStats] = useState({
    teamCount: 0,
    teamActive: 0,
    teamAttendanceToday: { present: 0, absent: 0 },
    teamByRole: [],               // <-- Replacing teamByDept
    attendanceTrend: [],
    pendingApprovals: { leave: 0, expense: 0 },
    recentAttendance: [],
    recentGrievances: []
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3010/dashboard/summary/${supervisorId}`)
      .then(res =>
        setStats({
          ...res.data,
          teamByRole: res.data.teamByRole || []   // ← SAFE DEFAULT
        })
      )
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ marginTop: 50 }} />;

  // Replace old dept chart → NEW ROLE CHART
  const roleData = (stats.teamByRole || []).map(r => ({
    type: r.role,
    value: r.count
  }));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "inherit", fontSize: 20, fontWeight: "bold" }}>
        Supervisor Dashboard
      </Header>

      <Content style={{ padding: 20 }}>
        
        {/* Top Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card title="Team Size">{stats.teamCount}</Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card title="Active Members">{stats.teamActive}</Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card title="Present Today">{stats.teamAttendanceToday.present}</Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card title="Absent Today">{stats.teamAttendanceToday.absent}</Card>
          </Col>
        </Row>

        {/* Role Pie + Approvals */}
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} md={12}>
            <Card title="Team by Job Role">
              <Pie
                data={roleData}
                angleField="value"
                colorField="type"
                height={300}
              />
            </Card>
          </Col>

          {/* <Col xs={24} md={12}>
            <Card title="Pending Approvals">
              <p>Leave Requests: {stats.pendingApprovals.leave}</p>
              <p>Expense Requests: {stats.pendingApprovals.expense}</p>
              <Button type="primary" onClick={() => navigate("/supervisor/approvals")}>
                Manage Approvals
              </Button>
            </Card>
          </Col> */}
          <Col xs={24} md={12}>
            <Card title="Team Attendance Trend (14 Days)">
              <Line
                data={stats.attendanceTrend}
                xField="date"
                yField="present"
                smooth
                height={300}
              />
            </Card>
          </Col>
        </Row>

        {/* Attendance Trend */}
        {/* <Row style={{ marginTop: 20 }}>
          <Col xs={24}>
            <Card title="Team Attendance Trend (14 Days)">
              <Line
                data={stats.attendanceTrend}
                xField="date"
                yField="present"
                smooth
                height={250}
              />
            </Card>
          </Col>
        </Row> */}

        {/* Recent Logs & Grievances */}
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} md={12}>
            <Card title="Recent Attendance Logs">
              {stats.recentAttendance.map(a => (
                <div key={a._id} style={{ marginBottom: 8 }}>
                  <strong>{a.userId.firstName} {a.userId.lastName}</strong>
                  <div>{a.date} — {a.status}</div>
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Recent Grievances">
              {stats.recentGrievances.map(g => (
                <div key={g._id} style={{ marginBottom: 8 }}>
                  <strong>{g.description}</strong>
                  <div>Status: {g.status}</div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>

      </Content>
    </Layout>
  );
};

export default SupervisorDashboard;
