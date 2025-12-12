import React, { useState, useEffect } from "react";
import { Table, Button, Form, Input, InputNumber, Switch, message, Spin, Modal, Select } from "antd";
import axios from "axios";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const [searchId, setSearchId] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3010/emp/employees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      employeeId: record.employeeId,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      baseSalary: record.baseSalary,
      isActive: record.isActive,
      role: record.role,
    });
    setEditingKey(record._id);
  };

  const cancel = () => setEditingKey("");

  const save = async (record) => {
    try {
      const values = await form.validateFields();
      await axios.put(`http://localhost:3010/emp/employees/${record._id}`, values);
      message.success("Updated successfully");
      setEditingKey("");
      fetchEmployees();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const handleAddEmployee = async (values) => {
    try {
      await axios.post("http://localhost:3010/emp/addemployees", values);
      message.success("Employee added successfully");
      setIsModalOpen(false);
      addForm.resetFields();
      fetchEmployees();
    } catch (err) {
      message.error("Failed to add employee");
    }
  };

  const columns = [
    {
      title: (
        <div>
          Employee ID
          <Input
            placeholder="Search by ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>
      ),
      dataIndex: "employeeId",
      key: "employeeId",
      sorter: (a, b) => a.employeeId.localeCompare(b.employeeId),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item
            name="employeeId"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Employee ID required" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          record.employeeId
        ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item
            name="firstName"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "First name required" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          record.firstName
        ),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item
            name="lastName"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Last name required" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          record.lastName
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item
            name="email"
            style={{ margin: 0 }}
            rules={[{ required: true, type: "email", message: "Valid email required" }]}
          >
            <Input />
          </Form.Item>
        ) : (
          record.email
        ),
    },
    {
      title: "Base Salary",
      dataIndex: "baseSalary",
      key: "baseSalary",
      sorter: (a, b) => (a.baseSalary || 0) - (b.baseSalary || 0),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item
            name="baseSalary"
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Salary required" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          record.baseSalary
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item name="role" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Sales_Executive">Sales Executive</Select.Option>
              <Select.Option value="Warehouse_Worker">Warehouse Worker</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          record.role
        ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1),
      render: (_, record) =>
        isEditing(record) ? (
          <Form.Item name="isActive" valuePropName="checked" style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
        ) : record.isActive ? "Yes" : "No",
    },
    {
      title: "Action",
    fixed: 'end',
      key: "action",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <>
            <Button type="link" onClick={() => save(record)}>
              Save
            </Button>
            <Button type="link" onClick={cancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button type="link" onClick={() => edit(record)}>
            Edit
          </Button>
        );
      },
    },
  ];

  // Filter employees by search ID
  const filteredData = searchId
    ? employees.filter((x) =>
        String(x.employeeId || "").toLowerCase().includes(searchId.toLowerCase())
      )
    : employees;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Employee Data</h2>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Add
        </Button>
      </div>

      <Form form={form} component={false}>
        {loading ? (
          <Spin style={{ marginTop: 50 }} />
        ) : (
          <Table
          scroll={{ x: 'max-content' }}
          
            dataSource={filteredData}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            
          />
        )}
      </Form>

      <Modal
        title="Add New Employee"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={addForm} onFinish={handleAddEmployee}>
          <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="baseSalary" label="Base Salary" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="Sales_Executive">Sales Executive</Select.Option>
              <Select.Option value="Warehouse_Worker">Warehouse Worker</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeTable;
