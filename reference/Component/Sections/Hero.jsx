import React from 'react';
import { useNavigate } from 'react-router-dom';
const Hero = () => {
  const navigate = useNavigate();
  return (
    <div id='home' className="">
    <div
      className="min-h-screen flex  items-center"
      style={{
      }}>
      <div className="bg-transparent p-8 rounded ">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Welcome to <span className='text-[#ff0000]'>New Bharani Studio</span></h1>
        <p className="text-gray-200 font-medium">Capturing Memories, Creating Stories</p>
        <button onClick={()=>{navigate('/User/login')}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5">
          Get In
        </button>
      </div>
    </div>
    </div>
  );
};

export default Hero;
