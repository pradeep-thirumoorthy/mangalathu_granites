import {  useState } from 'react';
import logo from '../../assets/376235015_1019871652673631_6807441484134153821_n.jpg'
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';


const useRazorpayNow = (requestData) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  console.log("requestData",requestData.dimension);
  const initiatePayment = async () => {
    setLoading(true);
    try {
        const response = await fetch(`https://studio-backend-sigma.vercel.app/user/Product/cart/paynow`, {
          method: 'POST',
          body: JSON.stringify({
            dimension: requestData.dimension,
            frameColor: requestData.frameColor
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

      const order = await response.json();
      console.log(order);
      
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
            requestData,
            billAmount:order.amount,
            ...response,
          };
          console.log(body)
          const validateRes = await fetch(
            "https://studio-backend-sigma.vercel.app/User/Product/BuyNow",
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
          navigate("/User/Customize");

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

export default useRazorpayNow;
