import React, { useState, useEffect } from "react";
import { Card, Row, Col, Image, Popconfirm, message } from "antd";
import Meta from "antd/es/card/Meta";
import axios from "axios";
import { SettingOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';

const Gallery = () => {
  const [images, setImages] = useState([]);

  // Fetch images from /user/Gallery route on port 3010 using Axios
  useEffect(() => {
    axios.get('https://studio-backend-sigma.vercel.app/User/Gallery',{withCredentials:true})
      .then(response => {
        setImages(response.data.images); // Set images in state
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, []);
  const handleDelete = async (id) => {
    console.log(id);
    try {
      // Make DELETE request to delete the image with the specified ID
      const response = await axios.delete(`https://studio-backend-sigma.vercel.app/User/Gallery/Delete/${id}`, { withCredentials: true });
      // Remove the deleted image from the state
      setImages(images.filter(image => image.id !== id));
      message.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Failed to delete image');
    }
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://studio-backend-sigma.vercel.app/User/Gallery/',{ withCredentials: true });
        setImages(response.data.images);
        console.log(response);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);
  return (
    <>
      Gallery:
      <Row gutter={[16, 16]} style={{ padding: '10px', marginRight: 0 }}>
        {images.map((image, index) => (
          
          <Col style={{margin:'0px'}} key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
          style={{
            width: 300,
          }}
          cover={
            <Image width={300} height={200} src={image.image}/>
          }
          actions={[
            <SettingOutlined key="setting" />,
            <EditOutlined key="edit" />,
            <Popconfirm
                  title="Are you sure you want to delete this image?"
                  onConfirm={() => handleDelete(image.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined key="ellipsis" />
                </Popconfirm>,
          ]}
        >
        </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Gallery;
