import React, { useState, useEffect } from 'react';
import { FloatButton, Popover, List, Avatar, Button, message, Flex } from 'antd';
import { ShoppingCartOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';

import useRazorpay from './useRazorpay';
const Cart = () => {
  const [totalAmount,setTotalAmount] = useState(0);
  
  const { loading, initiatePayment } = useRazorpay();
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('https://studio-backend-sigma.vercel.app/user/Product/Cart', { withCredentials: true });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveCartItem = async (itemId) => {
    try {
      await axios.delete(`https://studio-backend-sigma.vercel.app/user/Product/removeCart/${itemId}`, { withCredentials: true });
      setCartItems(cartItems.filter(item => item._id !== itemId));

      message.success('Item removed from cart successfully');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      message.error('Failed to remove item from cart');
    }
  };

  const handleCartToOrders = async () => {
    try {
      if (cartItems.length > 0) {

        
        await initiatePayment();
  
        // Proceed to move items to orders
        // const response = await axios.post('https://studio-backend-sigma.vercel.app/user/Product/CartToOrders', null, { withCredentials: true });
        // if (response.data.success) {
        //   message.success('Cart items moved to orders successfully');
        //   setCartItems([]);
        // } else {
        //   message.error('Failed to move cart items to orders');
        // }
      } else {
        message.info('Your cart is empty');
      }
    } catch (error) {
      console.error('Error moving cart items to orders:', error);
      message.error('Server error');
    }
  };
  

  return (
    <Popover
      title="Cart Items"
      content={
        <div style={{ width: '50vh' }}>
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={item => (
              <List.Item
  actions={[
    <Button type="danger" onClick={() => handleRemoveCartItem(item._id)}>Remove</Button>
  ]}
>
  <List.Item.Meta
    avatar={<Avatar src={item.image} />}
    title={item.dimension}
    description={`Color: ${item.frameColor}`}
  />
  <div>Amount: {item.amount}</div>
</List.Item>
            )}
          />
          <Flex justify='right'><Button onClick={handleCartToOrders}><ShopOutlined /></Button></Flex>
        </div>
      }
      trigger="click"
    >
      <FloatButton icon={<ShoppingCartOutlined />} />
    </Popover>
  );
};

export default Cart;
