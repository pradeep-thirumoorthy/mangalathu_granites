import React from 'react';
import {slides} from '../../Data'; 

import Carousel from './Carousel';
// const slides =[
//   "https://i.ibb.co/ncrXc2V/1.png",
//   "https://i.ibb.co/B3s7v4h/2.png",
//   "https://i.ibb.co/XXR8kzF/3.png",
//   "https://i.ibb.co/yg7BSdM/4.png",
// ];

const Products = () => {
  return (
    <div id='products' className='flex flex-col justify-center items-center m-6 pt-6 pb-6 '>
      <h1 className='font-bold text-center text-[25px] mb-[10px] text-[#ffffff] m-6 pt-6 pb-6'>Our Products</h1>
      <div className='max-w-lg w-full rounded-lg shadow-lg' style={{overFlowX:'hidden'}}>
      <Carousel>
        {slides.map((item) => (

          <img  src={item} className='object-cover w-full rounded-xl'/>
        ))}
      </Carousel>
      </div>
    </div>
  )
}

export default Products