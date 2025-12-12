import React, { useEffect, useState } from "react";
import { Card, QRCode, Row, Col, Tag, Spin, message, Typography } from "antd";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;

// Component to render a label/value pair
const DetailItem = ({ label, value }) => (
  <p style={{ margin: "4px 0" }}>
    <Text strong>{label}</Text> {value || "—"}
  </p>
);

// Scrollable list component
const ScrollableList = ({ items, renderItem }) => (
  <div style={{ maxHeight: 250, overflowY: "auto", paddingRight: 8 }}>
    {items.length > 0 ? items.map(renderItem) : <Text type="secondary">No Data</Text>}
  </div>
);

const cardStyle = { padding: 16, height: "100%" };

const WageWorkerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const userSession = JSON.parse(sessionStorage.getItem("userData"));
  const userId = userSession?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const res = await axios.get(
          `http://localhost:3010/dashboard/summary/wageWorker/${userId}`,
          { params: { month, year } }
        );

        if (res.data.success) setData(res.data.data);
        else message.error(res.data.message || "Failed to fetch dashboard data");
      } catch (err) {
        console.error(err);
        if (err.response) message.error(`Server Error: ${err.response.status}`);
        else if (err.request) message.error("No response from server. Check backend URL and CORS.");
        else message.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  if (loading) return <Spin style={{ margin: 50 }} size="large" />;
  if (!data) return <p style={{ padding: 20 }}>No data available</p>;

  const { user, attendance, payroll, leaves, notices, grievances } = data;
  const today = new Date().toISOString().slice(0, 10);

  const qrValue = JSON.stringify({
    id: user._id,
    employeeId: user.employeeId,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    department: user.department,
  });

  const presentDays = attendance?.filter(a => a.status === "Present").length || 0;
  const absentDays = attendance?.filter(a => a.status === "Absent").length || 0;
  const lateDays = attendance?.filter(a => a.status === "Late").length || 0;

  const todayAtt = attendance?.find(a => a.date === today);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Wage Worker Dashboard</Title>

      <Row gutter={[20, 20]} align="stretch">
        {/* QR Code */}
        <Col xs={24} sm={24} md={8} style={{ display: "flex" }}>
          <Card title="" style={{ textAlign: "center", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <QRCode value={qrValue} size={200} />
          </Card>
        </Col>

        {/* Personal Details */}
        <Col xs={24} sm={24} md={8} style={{ display: "flex" }}>
          <Card title="Your Details" style={{ flex: 1 }}>
            <DetailItem label="Name:" value={`${user.firstName} ${user.lastName}`} />
            <DetailItem label="Employee ID:" value={user.employeeId} />
            <DetailItem label="Role:" value={user.role} />
            <DetailItem label="Department:" value={user.department} />
          </Card>
        </Col>

        {/* Today's Attendance */}
        <Col xs={24} sm={24} md={8} style={{ display: "flex" }}>
          <Card title="Today's Attendance" style={{ flex: 1 }}>
            {todayAtt ? (
              <>
                <DetailItem label="Date:" value={today} />
<DetailItem 
  label="Clock In: " 
  value={todayAtt.clockIn ? moment(todayAtt.clockIn).format("HH:mm") : "-"} 
/>
<DetailItem 
  label="Clock Out: " 
  value={todayAtt.clockOut ? moment(todayAtt.clockOut).format("HH:mm") : "-"} 
/>

                <p><Text strong>Status:</Text> <Tag color={todayAtt.status === "Absent" ? "red" : "green"}>{todayAtt.status}</Tag></p>
              </>
            ) : <Text type="secondary">No attendance record today</Text>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card title="Monthly Attendance" style={cardStyle}>
            <DetailItem label="Present Days:" value={presentDays} />
            <DetailItem label="Absent Days:" value={absentDays} />
            <DetailItem label="Late Entries:" value={lateDays} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Payroll (This Month)" style={cardStyle}>
            {payroll ? (
              <>
                <DetailItem label="Base Wage:" value={`₹${payroll.financials.baseSalary}`} />
                <DetailItem label="Overtime pay:" value={`₹${payroll.financials.overtimeHours}`} />
                <DetailItem label="Net Wage:" value={`₹${payroll.financials.netSalary}`} />
                <p><Text strong>Status:</Text> <Tag color={payroll.status === "Paid" ? "green" : "orange"}>{payroll.status}</Tag></p>
              </>
            ) : <Text type="secondary">No payroll data</Text>}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="HR Announced Leaves (This Month)" style={cardStyle}>
            <ScrollableList
              items={leaves}
              renderItem={l => (
                <div key={l._id} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{l.date}</strong>
                    <small>{l.type}</small>
                  </div>
                  <div style={{ fontSize: 12 }}>{l.reason}</div>
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Notices" style={cardStyle}>
            <ScrollableList
              items={notices}
              renderItem={n => (
                <div key={n._id} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{n.title}</strong>
                    <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div style={{ fontSize: 12 }}>{n.content}</div>
                </div>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Your Grievances" style={cardStyle}>
            <ScrollableList
              items={grievances}
              renderItem={g => (
                <div key={g._id} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{g.ticketId}</strong>
                    <Tag color={g.status === "Open" ? "red" : "green"}>{g.status}</Tag>
                  </div>
                  <div style={{ fontSize: 12 }}>{g.description}</div>
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WageWorkerDashboard;
