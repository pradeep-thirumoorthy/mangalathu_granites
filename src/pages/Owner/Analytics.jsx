import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Spin } from "antd";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import axios from "axios";

const { Content, Footer } = Layout;

const AnalyticsCharts = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3010/dashboard/analytics2");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: 20 }}>

        {/* Attendance Trend */}
        <Card title="Attendance Trend (Last 14 Days)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#1890ff" name="Present" />
              <Bar dataKey="absent" fill="#ff4d4f" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Payroll Trend */}
        <Card title="Payroll Trend (Last 12 Months)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.payrollTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={val => `₹${val.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="netSalary" stroke="#1890ff" name="Net Salary" />
              <Line type="monotone" dataKey="grossSalary" stroke="#52c41a" name="Gross Salary" />
              <Line type="monotone" dataKey="overtimePay" stroke="#fa8c16" name="Overtime Pay" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Payroll Trend (Stacked) */}
        <Card title="Department Payroll Trend (Last 12 Months)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(analytics.departmentPayrollTrend).map(([month, deptData]) => {
                return { month, ...Object.fromEntries(Object.entries(deptData).map(([d, val]) => [d, val.netSalary])) };
              })}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={val => `₹${val.toLocaleString()}`} />
              <Legend />
              {analytics.departmentPayrollTrend && Object.values(analytics.departmentPayrollTrend[Object.keys(analytics.departmentPayrollTrend)[0]]).map((_, idx) => (
                <Bar key={idx} dataKey={Object.keys(analytics.departmentPayrollTrend[Object.keys(analytics.departmentPayrollTrend)[0]])[idx]} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Grievance Trend */}
        <Card title="Grievance Trend (Last 8 Weeks)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.grievanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Open" fill="#ff4d4f" />
              <Bar dataKey="In-Progress" fill="#faad14" />
              <Bar dataKey="Resolved" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Overtime Distribution */}
        <Card title="Overtime Hours Distribution (Wage Workers)" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.overtimeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="overtimeHours" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1890ff" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </Content>
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} Analytics Dashboard
      </Footer>
    </Layout>
  );
};

export default AnalyticsCharts;
