
import {InstagramOutlined,FacebookOutlined,LinkedinOutlined,WhatsAppOutlined,TwitterOutlined,YoutubeOutlined} from '@ant-design/icons'
import { Col, Image, Row } from 'antd'
import image from './justdial-seeklogo.com.svg'
import Link from 'antd/es/typography/Link'
import ambitionbox from './logo.svg';
const Footer = () => {
  return (
    <footer id="contact" className="text-white py-4" style={{paddingTop:'50px',paddingBottom:'50px'}}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Left Section: Contact Information */}
        <div className="mb-6 md:mb-0 pt-5">
          <h3 className="text-[25px] font-bold">Contact Us</h3>
          <p className="mt-2 font-bold">Email: <Link href='mailto:newbharani@gmail.com'>newbharani@gmail.com </Link></p>
          <p className="mt-1 font-bold">Phone: <Link href='tel:9842713333'>9842713333</Link></p>
          <p className="mt-1 font-bold">Address: 399/1,Arun complex,1 st Floor,
          <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Brough road,
          <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Erode. <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pin: 638001</p>
          <Row justify="center" className='mt-6 mb-6 pt-6' gutter={[16, 16]}>
          {/* Instagram */}
          <Col>
            <a href='https://www.instagram.com/_bharani_photography_/'><InstagramOutlined style={{ fontSize: '40px', color: 'white' }} /></a>
          </Col>
          {/* Facebook */}
          <Col>
            <a href='https://m.facebook.com/people/New-Bharani-Digital-Studio/100082989176343/'><FacebookOutlined style={{ fontSize: '40px', color: 'white' }} /></a>
          </Col>
          {/* WhatsApp */}
          <Col>
            <a href='https://wa.link/0jwqbe'><WhatsAppOutlined style={{ fontSize: '40px', color: 'white' }} /></a>
          </Col>
          {/* Twitter */}
          {/* <Col>
            <a href='https://www.instagram.com/_bharani_photography_/'><TwitterOutlined style={{ fontSize: '40px', color: 'white' }} /></a>
          </Col> */}
          {/* LinkedIn */}
          <Col>
            <a href='https://www.youtube.com/channel/UCcXC_JzkoVqcfA2R9PFA38w'><YoutubeOutlined style={{ fontSize: '40px', color: 'white' }} /></a>
          </Col>
          {/* Ambition Box */}
          <Col>
            <a href='https://www.ambitionbox.com/reviews/new-bharani-digital-studio-reviews/erode-location'><Image src={ambitionbox} height={40} preview={false} /></a>
          </Col>
          {/* Justdial */}
          <Col>
            <a href='https://www.justdial.com/Erode/New-Bharani-Digital-Studio-Near-Savitha-Hospital-Signal-Erode-Ho/9999PX424-X424-140213180236-I6U1_BZDET'><Image src={image} height={20} preview={false} /></a>
          </Col>
        </Row>
        </div>
        

        {/* Right Section: Location Map (Example Placeholder) */}
        <div className="md:w-1/3">
          <iframe
            title="Studio Location"
            style={{width:'100%',height:'40vh'}}
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1234.1909175318403!2d77.71765997730505!3d11.33981506849561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f3ed287e89b%3A0x6d48ed621cb951f0!2sNew%20Bharani%20Digital%20Studio!5e0!3m2!1sen!2sin!4v1714005126549!5m2!1sen!2sin"
          ></iframe>
        </div>
      </div>
    </footer>
  )
}

export default Footer