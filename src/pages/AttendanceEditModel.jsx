import React from "react";
import { Modal, Form, TimePicker, Select, Input, Button, message } from "antd";
import axios from "axios";
import moment from "moment";

const { Option } = Select;

const AttendanceEditModal = ({ open, onClose, record, onSaved }) => {
  if (!record) return null;

  const handleSave = async (values) => {
    try {
      await axios.patch(
        `http://localhost:3010/att/hr/attendanceEdit/${record._id}`,
        {
          clockIn: values.clockIn ? values.clockIn.format("HH:mm") : null,
          clockOut: values.clockOut ? values.clockOut.format("HH:mm") : null,
          status: values.status,
          overtimeHours: values.ot ?? 0,
        }
      );
      message.success("Attendance updated successfully");
      onSaved?.(); 
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update attendance");
    }
  };

  return (
    <Modal
      open={open}                 // correct prop
      title={`Edit Attendance: ${record.name ?? ""}`}
      onCancel={onClose}
      footer={null}
      destroyOnHidden               // correct cleanup prop
      maskClosable={false}         // prevent closing by clicking outside
    >
      <Form
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          clockIn: record.clockIn ? moment(record.clockIn, "HH:mm") : null,
          clockOut: record.clockOut ? moment(record.clockOut, "HH:mm") : null,
          status: record.status ?? "Present",
          ot: record.overtimeHours ?? 0,
        }}
      >
        <Form.Item label="Clock In" name="clockIn">
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item label="Clock Out" name="clockOut">
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select>
            <Option value="Present">Present</Option>
            <Option value="Half-Day">Half-Day</Option>
            <Option value="Absent">Absent</Option>
            <Option value="On Leave">On Leave</Option>
          </Select>
        </Form.Item>
        <Form.Item label="OT Hours" name="ot">
          <Input type="number" min={0} step={0.5} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AttendanceEditModal;
