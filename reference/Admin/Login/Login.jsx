import React, { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';

const Login = ({ onLoginResult }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [messageApi,sss] = message.useMessage();
  const handleLogin = async () => {
    try {
      const response = await axios.post('https://studio-backend-sigma.vercel.app/admin/login', { username, password }, { withCredentials: true });
      console.log(response.data);
      
      messageApi.open({
        key:1,
        type: (response.data.success)?'success':'error',
        content: response.data.message,
        duration: 2,
      });
      setTimeout(()=>{
        if (response.data.success) {
          const tokenCookie = response;
          console.log(tokenCookie)
          onLoginResult('success');
        } else {
          onLoginResult('failure');
        }
      },1000);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  

  return (
    <div className="flex w-full h-screen">
      {sss}
      <div className="w-full flex items-center justify-center lg:w-1/2">
      <div className=' w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
        <h1 className='text-5xl font-semibold'>Welcome Back</h1>
        <p className='font-medium text-lg text-gray-500 mt-4'>User login! Please enter your details.</p>
        <div className='mt-8'>
          <div className='flex flex-col'>
            <label htmlFor="username" className='text-lg font-medium'>Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              placeholder='Enter your name'
              className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='flex flex-col mt-4'>
            <label htmlFor="password" className='text-lg font-medium'>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='mt-8 flex flex-col gap-y-4'>
            <button onClick={handleLogin} className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01]  ease-in-out transform py-4 bg-violet-500 rounded-xl text-white font-bold text-lg'>Login</button>
          </div>
        </div>
      </div>
      </div>
      <div className="hidden relative w-1/2 h-full lg:flex items-center justify-center bg-gray-200">
        <div className="w-60 h-60 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 animate-spin"/> 
        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg" />
      </div>
    </div>
  );
};

export default Login;
