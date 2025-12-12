import React, { useState, useEffect } from "react";
import { Table, Input, Button, Spin, DatePicker } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { EditOutlined } from "@ant-design/icons";
import AttendanceEditModal from "./AttendanceEditModel";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { RangePicker } = DatePicker;

const AttendanceTable = ({ apiUrl }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editRecord, setEditRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [searchId, setSearchId] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  // Session values
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const role = session?.user?.role || "";
  const department = session?.user?.department || "";

  // Showroom supervisor restriction
  const isShowroomSupervisor =
    role.toLowerCase() === "supervisor" &&
    department.toLowerCase() === "showroom";

  // HR permission
  const isHR = role.toLowerCase() === "hr";

  const fetchData = async () => {
    setLoading(true);

    try {
      const userDepartment = department;

      const res = await axios.get("http://localhost:3010/att/attendanceLog", {
        params: { department: userDepartment },
      });

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  // Columns
  const columns = [
    {
      title: (
        <div>
          Employee ID
          <Input
            placeholder="Search Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>
      ),
      dataIndex: "employeeId",
      key: "employeeId",
    },

    { title: "Name", dataIndex: "name", key: "name" },

    {
      title: (
        <div>
          Date
          <RangePicker
            style={{ width: "100%", marginTop: 6 }}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </div>
      ),
      dataIndex: "date",
      key: "date",
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "--"),
    },

    { title: "Status", dataIndex: "status", key: "status" },

    {
      title: "Clock In",
      dataIndex: "clockIn",
      key: "clockIn",
      render: (v) => (v ? dayjs(v).format("HH:mm") : "--"),
    },

    {
      title: "Clock Out",
      dataIndex: "clockOut",
      key: "clockOut",
      render: (v) => (v ? dayjs(v).format("HH:mm") : "--"),
    },

    // OT column visible ONLY if NOT showroom supervisor
    !isShowroomSupervisor && {
      title: "OT",
      dataIndex: "overtimeHours",
      key: "overtimeHours",
    },

    // Action column visible ONLY for HR
    isHR && {
      title: "Action",
    fixed: 'end',
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditRecord(record);
            setModalVisible(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ].filter(Boolean);

  // Filter by Employee ID
  let filteredData = searchId
    ? data.filter((x) =>
        String(x.employeeId || "")
          .toLowerCase()
          .includes(searchId.toLowerCase())
      )
    : data;

  // Filter by date range
  const [start, end] = dateRange || [];

if (start && end) {
  filteredData = filteredData.filter((x) => {
    const d = dayjs(x.date);
    return (
      d.isSameOrAfter(dayjs(start), "day") &&
      d.isSameOrBefore(dayjs(end), "day")
    );
  });
}


  return (
    <>
      {loading ? (
        <Spin size="large" style={{ marginTop: 50, display: "block" }} />
      ) : (
        <Table
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
        />
      )}

      <AttendanceEditModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        record={editRecord}
        onSaved={fetchData}
      />
    </>
  );
};

export default AttendanceTable;
