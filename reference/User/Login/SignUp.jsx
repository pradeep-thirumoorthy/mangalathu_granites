import React, { useState } from 'react';
import axios from 'axios';
import { Button, ConfigProvider, message } from 'antd';
import ShowOTPConfirm from './OTP';

const SignUp = () => {
    const [phoneNo, setPhoneNo] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(true); // Define usernameAvailable state
    const [error, setError] = useState('');
    const [accessButton,setAcessButton]=useState(false);
  
    const checkUsernameAvailability = async () => {
        try {
          const response = await axios.get(`https://studio-backend-sigma.vercel.app/user/check-username?username=${username}`);
          console.log(response.data);
          if (!response.data.available) {
            setUsernameAvailable(false);
          } else {
            setUsernameAvailable(true);
          }
        } catch (error) {
          console.error('Error checking username availability:', error);
        }
      };
    
  
    const handleSignUp = async () => {
      try {
        if (!firstName || !lastName || !username || !password || !confirmPassword || !phoneNo || !email) {
          setError('Please fill in all fields');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
  
        // Check if username is available
        await checkUsernameAvailability();
        if (!usernameAvailable) {
          setError('Username is not available');
          return;
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address');
          return;
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNo)) {
          setError('Please enter a valid 10-digit phone number');
          return;
        }
        // Send sign-up request to server
        const response = await axios.post('https://studio-backend-sigma.vercel.app/user/signup', {
          phoneNo:phoneNo,
          firstName,
          lastName,
          username,
          password,
          email:email
        });
        if (response.data.success) {
          message.success('User Created');
          window.location.reload();
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        setError('Server error. Please try again later.');
      }
    };

  return (
    <div className="flex w-full ">
      <div className="w-full flex items-center justify-center ">
        <div className=' w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
          <h1 className='text-5xl font-semibold'>Welcome Back</h1>
          <p className='font-medium text-lg text-gray-500 mt-4'>User Signup! Please enter your details.</p>
          <div className='mt-8'>
            <div className='flex flex-col'>
              <label htmlFor="firstName" className='text-lg font-medium'>First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                placeholder='Enter your First Name'
                className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div  className='flex flex-col mt-4'>
            <label htmlFor="lastName" className='text-lg font-medium'>Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              placeholder='Enter your Last Name'
                  className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
              onChange={(e) => setLastName(e.target.value)}
            />
            </div>
            <div  className='flex flex-col mt-4'>
              <label htmlFor="username" className='text-lg font-medium'>Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                placeholder='Enter Username'
                className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                onChange={(e) => setUsername(e.target.value)}
                onBlur={checkUsernameAvailability}
              />
              {!usernameAvailable && <p style={{ color: 'red' }}>Username is not available</p>} {/* Show error message */}
            </div>
            <div  className='flex flex-col mt-4'>
              <label htmlFor="Email" className='text-lg font-medium'>Email:</label>
              <div  className='flex  mt-4'><input
                type="text"
                id="email"
                value={email}
                placeholder='Enter Email'
                className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                onChange={(e) => {setEmail(e.target.value);setAcessButton(false)}}
                onBlur={checkUsernameAvailability}
              />
              <ShowOTPConfirm setAcessButton={setAcessButton} email={email}/>
              </div>
            </div>
            <div  className='flex flex-col mt-4'>
              <label htmlFor="Phone Number" className='text-lg font-medium'>Phone no:</label>
              <input
                type="text"
                id="Phone Number"
                value={phoneNo}
                placeholder='Enter Phone Number'
                className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                onChange={(e) => setPhoneNo(e.target.value)}
                onBlur={checkUsernameAvailability}
              /> {/* Show error message */}
            </div>
            <div  className='flex flex-col mt-4'>
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
            <div  className='flex flex-col mt-4'>
              <label htmlFor="confirmPassword" className='text-lg font-medium'>Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                placeholder="Confirm your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className='mt-8 flex flex-col gap-y-4'>
      <Button
        disabled={!accessButton}
        className='bg-violet-500 rounded-xl text-white font-bold text-lg'
        onClick={handleSignUp}
      >
        Sign Up
      </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;









