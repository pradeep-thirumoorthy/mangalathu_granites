import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import Login from "./Login/Login";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Spin,Result,Button} from 'antd';
import Navbar from "./Navbar/Navbar";
import Orders from "./Orders/Orders";
import Calendar from "./Dashboard/Calendar";





const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const checkLoginStatus = () => {
      fetch('https://studio-backend-sigma.vercel.app/admin/checkToken', {
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
      navigate('/Admin/Dashboard');
    } else {
      
    }
  };

  const AdminRoutes = ()=>
  (
        <Routes>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="Orders" element={<Orders/>}/>
            <Route path="Calendar" element={<Calendar/>}/>
            <Route path="*" element={<NotFound link={'/User/dashboard'} content={"Back To Dashboard"} />}/>
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

  return(
    <>

      {isChecking ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
          <Spin size="large" />
        </div>
      ) : isLoggedIn ? (
        <Navbar children={<AdminRoutes />} setIsLoggedIn={setIsLoggedIn} setIsChecking={setIsChecking}></Navbar>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginResult={handleLoginResult} />} />
          <Route path="*" element={<NotFound link={'/Admin/login'} content={"Back To Admin Login"} />} />
        </Routes>
      )}
    </>);
};
  
export default Admin;



