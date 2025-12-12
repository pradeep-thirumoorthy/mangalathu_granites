import { useState, useEffect } from 'react';
import { Card, Col, Row } from 'antd';

const { Meta } = Card;
import {PhoneOutlined} from '@ant-design/icons'
const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://studio-backend-sigma.vercel.app/services', {
        credentials: 'include'
      });
      
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div id="services" style={{paddingTop:'50px',paddingBottom:'50px'}}>
    <h1 className="font-bold text-center py-[10px] text-[25px] text-[#ffffff]">Our Services</h1>
    <Row gutter={[16, 16]} style={{ justifyContent: 'space-around' }}>
  {services.map(service => (
    <Col key={service._id} xs={24} sm={12} md={8} lg={6}>
      <Card style={{ marginBottom: 20 }} cover={<img alt="Service" src={service.imageUrl} />}>
        <Meta
          title={service.title}
          description={service.description}
        />
        <div>
          <PhoneOutlined rotate={90} style={{padding:'10px'}}/>
          <a href={`tel:${service.contactNumber}`}>{service.contactNumber}</a>
        </div>
      </Card>
    </Col>
  ))}
</Row>
</div>

  );
};

export default Services;
