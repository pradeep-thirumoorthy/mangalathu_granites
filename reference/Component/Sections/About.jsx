import React from 'react';
import StudioImage from '../../assets/6.jpg'; 
import {CameraOutlined } from '@ant-design/icons';

const About = () => {
  return (
    <div id="about" style={{paddingTop:'50px',paddingBottom:'50px'}} className="container mx-auto px-4 py-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-3xl">About Us</h1>
        <p className="text-gray-600 mt-2">Learn more about New Bharani studio</p>
      </div>

      {/* Studio Information */}
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Studio Image */}
        <div className="md:w-1/2">
          <img src={StudioImage} alt="Studio" className="rounded-lg shadow-lg mb-4 md:mb-0 w-[200px]" />
        </div>

        {/* Studio Description */}
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">Welcome to Our Studio</h2>
          <p className="mb-4">
            We are a digital photo studio specializing in capturing precious moments and creating lasting memories.
          </p>
          <p className="mb-4">
            Our team of experienced photographers is dedicated to providing high-quality photography services for
            weddings, portraits, events, and more.
          </p>
          <div className="flex items-center">
          <CameraOutlined  className="text-xl mr-2" />
            <p className="font-semibold">Capturing Moments Since 2005</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About