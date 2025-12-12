import React, { useState, useEffect } from 'react';
import {Route, Routes, useNavigate } from "react-router-dom";
import {Button, Result, Spin } from "antd";
import World3d from './Customizer/World';
import Gallery from './Gallery/Gallery';
import Order from "./Order/Order";
import Login from "./Login/Login";
import SignUp from './Login/SignUp';
import Navbar from './Navbar/Navbar';
import Preview from '../Customizer/components/Preview';


const User = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const checkLoginStatus = () => {
      fetch('https://studio-backend-sigma.vercel.app/user/checkToken', {
        method: 'GET',
        credentials: 'include',
      })
      .then(response => {
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(error => {
        console.error('Error checking login status:', error);
      })
      .finally(() => {
        setIsChecking(false);
      });
    };
  
    checkLoginStatus();
  }, []);

  

  const handleLoginResult = (result) => {
    if (result === 'success') {
      setIsLoggedIn(true);
      navigate('/User/Customize');
    } else {
      
    }
  };

  const UserRoutes = () => (
    <Routes>
      <Route path="Customize" element={<World3d />} />
      <Route path="Gallery" element={<Gallery />} />
      <Route path="Orders" element={<Order />} />
      <Route path="preview" element={<Preview />}/>
      <Route path="*" element={<NotFound link={'/User/Dashboard'} content={"Back To Dashboard"} />} />
    </Routes>
  );

  const NotFound = ({ link, content }) => (
    <div style={{ height: '90vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button  onClick={() => { navigate(link) }}>{content}</Button>}
      />
    </div>
  );

  return (
    <>
      {isChecking ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
          <Spin size="large" />
        </div>
      ) : isLoggedIn ? (
        <Navbar children={<UserRoutes/>} setIsLoggedIn={setIsLoggedIn} setIsChecking={setIsChecking}></Navbar>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginResult={handleLoginResult} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound link={'/User/login'} content={"Back To Login"} />} />
        </Routes>
      )}
    </>
  );
};

export default User;
