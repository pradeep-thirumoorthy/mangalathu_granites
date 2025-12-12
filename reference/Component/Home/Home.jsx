import React from 'react'
import Hero from '../Sections/Hero'
import Products from '../Sections/Products'
import Services from '../Sections/Services'
import About from '../Sections/About'
import Footer from '../Sections/Footer'
import Navbar from '../Navbar/Navbar'
import backgroundImage from './../../assets/Types-of-camera-shots-and-angles.jpg';

const Home = () => {
  return (
    <main 
      style={{ scrollBehavior: 'smooth', backgroundImage: `url(${backgroundImage})`,backgroundAttachment:'fixed',backgroundSize:'cover',backgroundRepeat:'no-repeat' }}
      className='relative'
    >
      <Navbar />
      <section className='px-[0px] py-[10px]'><Hero /></section>
      <section className='px-[10px] py-[20px] bg-blue-100'><About /></section>
      <section className='px-[10px] py-[20px]'><Products /></section>
      <section className='px-[10px] py-[20px] bg-blue-100'><Services /></section>
      <section className='px-[10px]'><Footer /></section>
    </main>
  )
}


export default Home