import React, { useState, useEffect } from "react";
import { Button, Table, message, Spin, Select, DatePicker } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

const { Option } = Select;

const Export = () => {
  const [type, setType] = useState("users");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
      if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

      const res = await axios.get(`http://localhost:3010/export/${type}`, { params });

      if (!res.data.data || res.data.data.length === 0) {
        message.warning(`No ${type} found`);
        setData([]);
        setColumns([]);
        return;
      }

      const firstRow = res.data.data[0];

      const generatedColumns = Object.keys(firstRow).map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key,
      }));

      setColumns(generatedColumns);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setData([]);
      message.error(`Failed to fetch ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data.length) {
      message.error("No data to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `${type}_export_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  useEffect(() => {
    fetchData(); // auto-fetch on type change
  }, [type]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Export Data</h2>

      <Select value={type} onChange={setType} style={{ width: 200 }}>
        <Option value="users">Users</Option>
        <Option value="grievance">Grievance</Option>
        <Option value="attendance">Attendance</Option>
        <Option value="leaves">Leave</Option>
        <Option value="announcements">Announcements</Option>
        <Option value="payroll">Payroll</Option>
        <Option value="calendar">Warehouse Schedules</Option>
      </Select>

      <DatePicker
        style={{ marginLeft: 10 }}
        placeholder="Start Date"
        value={startDate}
        onChange={setStartDate}
      />
      <DatePicker
        style={{ marginLeft: 10 }}
        placeholder="End Date"
        value={endDate}
        onChange={setEndDate}
      />

      <Button type="primary" style={{ marginLeft: 10 }} onClick={fetchData}>
        Refresh
      </Button>

      <Button style={{ marginLeft: 10 }} onClick={exportToExcel}>
        Export to Excel
      </Button>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r, i) => i}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        )}
      </div>
    </div>
  );
};

export default Export;
