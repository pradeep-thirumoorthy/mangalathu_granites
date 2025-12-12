
import React, { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
import { Anchor, Avatar, ConfigProvider, Popover } from "antd";
import img from './../../assets/376235015_1019871652673631_6807441484134153821_n.jpg'
const Navbar = () => {
    useEffect(()=>{

    })
    const itemss = [
        { key: 'Login', title: 'Admin', href: '/admin/login' },
        { key: 'USer-Login', title: 'User', href: '/user/login' },
    ];
    return (
        <>
        
        <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent:'space-between',
          alignItems: 'center',
          background:'white'
        }}
      >
        <Avatar
    size={50}
    src={img}
    style={{minWidth:'50px', minHeight:'50px'}}
  />
        <ConfigProvider
  theme={{
    components: {
      Anchor: {
        linkPaddingInlineStart: (window.innerWidth / 5) - 100 > 24 ? (window.innerWidth / 5) - 100 : 24
      },
    },
  }}>
        <Anchor direction="horizontal" style={{display:'flex',justifyContent:'space-around',background:'white'}}
            items={[
                { key: 'home', href: '#home', title: 'Home' },
                { key: 'about', href: '#about', title: 'About' },
                { key: 'products', href: '#products', title: 'Products' },
                { key: 'services', href: '#services', title: 'Services' },
                { key: 'contact', href: '#contact', title: 'Contact' }
            ]}
        />
        </ConfigProvider>
        <Popover content={<div style={{display:'block'}}>
            
            {itemss.map(item => (
                <div>
                        <a key={item.key} href={item.href}>{item.title}</a>
                    </div>))}
            
            </div>} trigger="click">
        <UserOutlined
    style={{fontSize:'50'}}
    src={img}
  />
    </Popover>
        
      </Header>
        </>
    );
}

export default Navbar;
