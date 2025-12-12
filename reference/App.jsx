
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './Admin';
import User from './User';
import Home from './Component/Home/Home';
import { Result } from 'antd';
import QRCodeScanner from './Qrreader';
import { Analytics } from "@vercel/analytics/react"
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/user/*" element={<User />} />
        <Route path='/Hello' element={<>Hello</>}/>


        <Route path="/*" element={<div style={{height:'90vh'}}><Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
  />
  <Analytics/>
  <QRCodeScanner/>
  
  
  </div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
