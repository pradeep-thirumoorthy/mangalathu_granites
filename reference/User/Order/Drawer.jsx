// DrawerComponent.jsx
import React, { useEffect, useState } from 'react';
import { Drawer, Button, Col, Card, Descriptions, Flex, Segmented, QRCode, Result, Modal } from 'antd';
import axios from 'axios';
import Test from './QRScanner';
import Preview from '../../Customizer/components/Preview';
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract and return the date part
  };
  
const DrawerComponent = ({ visible, onClose, order }) => {
    const [items,setItems]=useState(null);
    
  const [userInfo, setUserInfo] = useState(null);

  const [previewItem, setPreviewItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Information');
  
    useEffect(() => {
        
        const fetchOrders = async () => {
            try {
              const response = await axios.get(`https://studio-backend-sigma.vercel.app/admin/Product/items`, {
                params: {
                  productId: order._id,
                  username: order.username
                },
                withCredentials: true
              });
              console.log(response.data);
              setItems(response.data.items);
              setUserInfo(response.data.userInfo);
            } catch (error) {
              console.error('Error fetching orders:', error);
            }
          };
          
        if(visible || order){
          fetchOrders();}
      }, [visible, order]);


      const handlePreview = (item) => {
        setPreviewItem(item);
        console.log(item);
        setModalVisible(true);
      };
    
  return (
    <Drawer
    width={700}
      open={visible}
      onClose={() => { onClose(); setItems(null); setUserInfo(null); }}
      title="Order Information"
    >
      <div>
        <Segmented
          options={['Information', 'Items', 'Actions']}
          onChange={(value)=>{setActiveTab(value)}}
          activeKey={activeTab}
        />

        {activeTab === 'Information' && (
          <div>
            {userInfo ? (
                <Flex align='flex-start'>
              <div>
                  <Descriptions title="Order Info" bordered column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}>
                  <Descriptions.Item label="Order ID">{order._id}</Descriptions.Item>
                  <Descriptions.Item label="Username">{order.username}</Descriptions.Item>
                  <Descriptions.Item label="Amount">{order.amount}</Descriptions.Item>
                  <Descriptions.Item label="Status">{order.status}</Descriptions.Item>
                  <Descriptions.Item label="Created At">{formatDate(order.createdAt)}</Descriptions.Item>
                  </Descriptions>
                  </div><div>
                  <Descriptions bordered title="User Information" column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}>
                  <Descriptions.Item label="Phone Number">{userInfo.phoneNo}</Descriptions.Item>
                  <Descriptions.Item label="First Name">{userInfo.firstName}</Descriptions.Item>
                  <Descriptions.Item label="Last Name">{userInfo.lastName}</Descriptions.Item>
                  <Descriptions.Item label="Email">{userInfo.email}</Descriptions.Item>
                  </Descriptions>
              </div>
              </Flex>
            ) : (
            <p>Loading more Information...</p>
            )}
          </div>
        )}

        {activeTab === 'Items' && (
          <div>
            {items ? (
              <div>
                <h3>Items</h3>
                <Col span={24}>
                  {items.map((item) => (
                    <Card
                      key={item._id}
                      hoverable
                      style={{ width: '200px', margin: '10px' }}
                      title="Item Details"
                      onClick={() => handlePreview(item)}
                    >
                      <p>Alignment: {item.align}</p>
                      <p>Dimension: {item.dimension}</p>
                      <p>Frame Color: {item.frameColor}</p>
                      <img src={item.image} alt="Item Image" style={{ maxWidth: '100%' }} />
                    </Card>
                  ))}
                </Col>
              </div>
            ) : (
              <p>Loading items...</p>
            )}
          </div>
        )}

{activeTab === 'Actions' && (
  <div>
    {/* Actions section */}
    {order && (
      <div>
        {order.status === 'Shipped' ? (
          <Test order={order} />
        ) : (
            <Result status="500" title="No Action Available" />
        )}
      </div>
    )}
  </div>
)}


      </div>
      <div id="my-qr-reader"></div>
      <Modal
        title="Preview"
        open={modalVisible}
        onCancel={() => setModalVisible(false)} // Close the modal when cancelled
        footer={null}
      >
        {previewItem && <Preview customizationData={previewItem} />} {/* Pass previewItem as props to World3d */}
      </Modal>
    </Drawer>
    
  );
};

export default DrawerComponent;
