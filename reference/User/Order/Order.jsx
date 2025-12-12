import React, { useState, useEffect } from 'react';
import { Table, Skeleton, Alert, Layout, Menu } from 'antd';
import axios from 'axios';
import DrawerComponent from './Drawer';

const { Sider, Content } = Layout;

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const isWideLayout = window.innerWidth > 991;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [status, setStatus] = useState('In Queue');
  useEffect(()=>{
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
  },[])
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`https://studio-backend-sigma.vercel.app/user/Product/Orders/${status}`, { withCredentials: true });
        setOrders(response.data);
        console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [status]);

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => {
        const date = new Date(text);
        return date.toISOString().split('T')[0];
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Alert type='info' message='(i)' onClick={() => { setSelectedOrder(record); setDrawerVisible(true); }} />
      ),
    },
  ];

  return (
    <Layout>
      <Sider theme='light' style={{ height: '100vh', position: 'fixed', zIndex: '5' }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <Menu
          onClick={(value) => setStatus(value.key)}
          selectedKeys={[status]}
          mode="vertical"
        >
          <Menu.Item key="In Queue">
            In Queue
          </Menu.Item>
          <Menu.Item key="Manufacturing">
            Manufacturing
          </Menu.Item>
          <Menu.Item key="Processing">
            Processing
          </Menu.Item>
          <Menu.Item key="Shipped">
            Shipped
          </Menu.Item>
          <Menu.Item key="Delivered">
            Delivered
          </Menu.Item>
          <Menu.Item key="Cancelled">
            Cancelled
          </Menu.Item>
        </Menu>
      </Sider>
      <Content style={{ marginLeft: isWideLayout ? '200px' : '0'}}>
        <Table
          scroll={{ x: 'max-content' }}
          
          columns={columns}
          dataSource={orders}
          loading={loading}
        />
        <DrawerComponent
          visible={drawerVisible}
          onClose={() => { setSelectedOrder(null); setDrawerVisible(false) }}
          order={selectedOrder}
        />
      </Content>
    </Layout>
  );
};

export default Orders;
