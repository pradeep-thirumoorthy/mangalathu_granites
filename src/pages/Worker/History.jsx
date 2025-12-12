import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Table, Spin, message, Typography, DatePicker, Button } from "antd";
import axios from "axios";
import moment from "moment";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthYear, setMonthYear] = useState(moment()); // Default to current month

  const userSession = JSON.parse(sessionStorage.getItem("userData"));
  const userId = userSession?.user?.id;

  const fetchAttendance = async (month, year) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3010/att/employee/${userId}`, {
        params: { month, year },
      });

      if (res.data.success) {
        setAttendanceData(res.data.data || []);
      } else {
        message.error(res.data.message || "Failed to fetch attendance");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const month = monthYear.month() + 1;
    const year = monthYear.year();
    fetchAttendance(month, year);
  }, [monthYear, userId]);

  const handleMonthChange = (date) => {
    if (!date) return;
    setMonthYear(date);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format("DD-MM-YYYY"),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Text
          strong
          style={{
            color:
              status === "Absent"
                ? "#f5222d"
                : status === "Late"
                ? "#fa8c16"
                : "#52c41a",
          }}
        >
          {status}
        </Text>
      ),
      filters: [
        { text: "Present", value: "Present" },
        { text: "Late", value: "Late" },
        { text: "Absent", value: "Absent" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Clock In",
      dataIndex: "clockIn",
      key: "clockIn",
      render: (time) => (time ? moment(time).format("HH:mm") : "—"),
    },
    {
      title: "Clock Out",
      dataIndex: "clockOut",
      key: "clockOut",
      render: (time) => (time ? moment(time).format("HH:mm") : "—"),
    },
    {
      title: "Overtime (hrs)",
      dataIndex: "overtimeHours",
      key: "overtimeHours",
      render: (hours) => hours || 0,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
        <Title style={{ }} level={3}>
          Attendance History
        </Title>

      <Content style={{ padding: "24px" }}>
        {/* Month Selector & Refresh */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <DatePicker
              picker="month"
              value={monthYear}
              onChange={handleMonthChange}
              format="MMMM YYYY"
              style={{ width: 200 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => fetchAttendance(monthYear.month() + 1, monthYear.year())}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        <Card>
          {loading ? (
            <div style={{ textAlign: "center", padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : attendanceData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={attendanceData}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              bordered
              scroll={{ x: "max-content" }}
            />
          ) : (
            <p style={{ textAlign: "center", padding: 20, color: "#888" }}>
              No attendance data for this month.
            </p>
          )}
        </Card>
      </Content>

      <Footer style={{ textAlign: "center" }}>
        Attendance Dashboard ©2025
      </Footer>
    </Layout>
  );
};

export default AttendanceHistory;
