import React, { useEffect, useState } from 'react';
import { Card, Popconfirm, Modal, Form, Input, Button, Row, Col  } from 'antd';
import {EditOutlined,EllipsisOutlined,DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import Meta from 'antd/es/card/Meta';


const { confirm } = Modal;
const ModalComponent = ({ visible, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onFinish = () => {
        const formData = {
            title: title,
            description: description,
            contactNumber: contactNumber,
            imageUrl: imageUrl
        };
    
        // Make POST request with form values as parameters
        axios.post('https://studio-backend-sigma.vercel.app/admin/services/add', formData,{withCredentials:true})
            .then((response) => {
                console.log('Service added successfully:', response.data);
                // Reset form fields and close modal
                setTitle('');
                setDescription('');
                setContactNumber('');
                setImageUrl('');
                onClose();
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error adding service:', error);
                // Handle error as needed
            });
    };

    return (
        <Modal
            title="Add New Item"
            visible={visible}
            onCancel={() => {
                // Reset state variables and close modal
                setTitle('');
                setDescription('');
                setContactNumber('');
                setImageUrl('');
                onClose();
            }}
            footer={null}
        >
            <div className="p-4 space-y-4">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                />
                <Input.TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                />
                <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Contact Number"
                />
                <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                />
                {imageUrl && <img src={imageUrl} alt="Item" style={{ maxWidth: '100%' }} />}
                <br/>
                <Button  onClick={onFinish}>
                    Submit
                </Button>
            </div>
        </Modal>
    );
};


const Dashboard = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    return (
        <>
            <Button onClick={showModal}>
                Add a Service
            </Button>
            <ModalComponent visible={modalVisible} onClose={closeModal} />
            <Display/>
        </>
    );
};

export default Dashboard;


const Display = () => {
    const [services, setServices] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('https://studio-backend-sigma.vercel.app/admin/services', { withCredentials: true });
                setServices(response.data.services);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
    }, []);

    const handleDelete = async (serviceId) => {
        try {
            console.log('Deleting service with ID:', serviceId);
            const response = await axios.delete(`https://studio-backend-sigma.vercel.app/admin/services/delete/${serviceId}`, { withCredentials: true });
            console.log('Service deleted:', response.data);
            window.location.reload();
            // Optionally, update the services list in the UI to reflect the deletion
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };
    

    const handleEdit = (service) => {
        setSelectedService(service);
        setEditModalVisible(true);
        form.setFieldsValue({
            title: service.title,
            description: service.description,
            contactnumber: service.contactNumber,
        });
    };

    const onFinishEdit = async (values) => {
        try {
            const updatedValues = {
                title: values.title,
                description: values.description,
                contactNumber: values.contactnumber,
                image: newImageUrl ? newImageUrl : imageUrl, // Use the new image URL if available, otherwise use the existing one
            };
    
            // Compare selectedService with updatedValues to find the changed fields
            const changedFields = {};
            for (const key in updatedValues) {
                if (selectedService[key] !== updatedValues[key]) {
                    changedFields[key] = updatedValues[key];
                }
            }
    
            if (Object.keys(changedFields).length === 0) {
                console.log('No changes detected. No update needed.');
                setEditModalVisible(false);
                return;
            }
    
            const response = await axios.post(`https://studio-backend-sigma.vercel.app/admin/services/edit/${selectedService._id}`, changedFields, { withCredentials: true });
            console.log('Service updated:', response.data);
            setEditModalVisible(false);
            if (newImageUrl) {
                setImageUrl(newImageUrl);
                setNewImageUrl(null);
            }
        } catch (error) {
            console.error('Error updating service:', error);
        }
    };
    
    

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <Row gutter={[16, 16]}>
                {services.map(service => (
                    <Col key={service._id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            style={{ marginBottom: 20 }}
                            cover={<img alt="Service" src={imageUrl || service.imageUrl} />}
                            actions={[
                                <Popconfirm
                                    title="Are you sure to delete this service?"
                                    onConfirm={() => handleDelete(service._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined key="delete" />
                                </Popconfirm>,
                                <EditOutlined key="edit" onClick={() => handleEdit(service)} />,
                                <EllipsisOutlined key="ellipsis" />,
                            ]}
                        >
                            <Meta
                                title={service.title}
                                description={service.description}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Edit Modal */}
            <Modal
                title="Edit Service"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={onFinishEdit} initialValues={{ title: selectedService?.title, description: selectedService?.description }}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the title' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter the description' }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="contactnumber" label="Contact Number" rules={[{ required: true, message: 'Please enter the Contact Number' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Change Photo">
                        <input type="file" onChange={handlePhotoChange} accept="image/*" />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};