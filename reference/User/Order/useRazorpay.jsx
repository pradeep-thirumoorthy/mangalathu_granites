import {  useState } from 'react';
import logo from '../../assets/376235015_1019871652673631_6807441484134153821_n.jpg'
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';


const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const initiatePayment = async () => {
    setLoading(true);
    try {
        const response = await fetch(`https://studio-backend-sigma.vercel.app/user/Product/cart/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

      const order = await response.json();
      console.log(order.amount);
      const options = {
        key: "rzp_test_lEjUkxcCd826xz",
        amount: order.amount,
        currency: 'INR',
        name: "New Bharani Studio",
        description: "Test Transaction",
        image: logo,
        order_id: order.id,
        handler: async function (response) {
          const body = {
            billAmount,
            ...response,
          };
          console.log(body)
          const validateRes = await fetch(
            "https://studio-backend-sigma.vercel.app/User/Product/CartToOrders",
            {
              method: "POST",
              body: JSON.stringify(body),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          
          const res = await validateRes.json();
          console.log(res);
          message.success("Payment successful");

          navigate("/orders");

        },

        prefill: {
          
        },

        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  

  return {
    loading,
    initiatePayment
  };
};

export default useRazorpay;
