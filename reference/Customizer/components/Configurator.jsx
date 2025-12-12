import { Button, Card, Col, Row } from "antd";
import { useCustomization } from "../contexts/Customization";
import { useEffect, useState } from "react";
import axios from 'axios';
import useRazorpayNow from "../../User/Order/useRazorpayNow";

const Configurator = () => {
  const {
    Align,
    setAlign,
    frameColors,
    frameColor,
    setframeColor,
    dimensions,
    dimensionsLength,
    setDimensions,
    setImage,
  } = useCustomization();
  
  const [FrameImage, setFrameImage] = useState();
  const [requestedData,setRequestedData]=useState({});
  const {initiatePayment}=useRazorpayNow(requestedData);
  const handleBuyNow = async () => {
    try {
      if (!FrameImage) {
        console.error('Please insert an image.');
        alert('Please insert the Photo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        const requestData = {
          align: Align ? 'Landscape' : 'Portrait',
          dimension: dimensions,
          frameColor: frameColor.name,
          image: imageData,
        };
        setRequestedData(requestData)
        console.log(requestedData);
        await initiatePayment();
      };
      
      reader.readAsDataURL(FrameImage);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  const handleAddcart = async () => {
    try {
      if (!FrameImage) {
        console.error('Please insert an image.');
        alert('Please insert the Photo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        const requestData = {
          align: Align ? 'Landscape' : 'Portrait',
          dimension: dimensions,
          frameColor: frameColor.name,
          image: imageData,
        };
        const response = await axios.post('https://studio-backend-sigma.vercel.app/user/Product/AddCart', requestData, { withCredentials: true });
        
        if (response.data.success) {
          console.log('Image uploaded successfully');
          window.location.href="/User/Gallery";
        } else {
          // Handle error
          console.error('Image upload failed:', response.data.message);
        }
      };
  
      reader.readAsDataURL(FrameImage);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  handleAddcart
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataURL = e.target.result;
        setImage(imageDataURL);
        setFrameImage(file);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    console.log(Align);
    // Calculate the amount whenever dimensions or frameColor changes
    calculateAmount(dimensions, frameColor.name);
  }, [dimensions, frameColor]);

  const [amount, setAmount] = useState(0); // State to store the calculated amount

  const basePrice = 10;
  const pricePerSquareUnit = 5;
  const calculateAmount = (dimension, frameColor) => {
    try {
      // Find the dimensions object based on the provided dimension
      const selectedDimension = dimensionsLength.find(
        (dim) => dim.x === dimension.x && dim.y === dimension.y
      );
      if (!selectedDimension) {
        throw new Error("Invalid dimension");
      }

      // Find the frame color object based on the provided frame color
      const selectedFrameColor = frameColors.find(
        (color) => color.name === frameColor
      );
      if (!selectedFrameColor) {
        throw new Error("Invalid frame color");
      }

      // Calculate the area of the frame
      const area = selectedDimension.x * selectedDimension.y;

      // Calculate the amount based on area and frame color
      const calculatedAmount = basePrice + area * pricePerSquareUnit;
      setAmount(calculatedAmount*20);
    } catch (error) {
      console.error("Error calculating amount:", error);
    }
  };
  const [alignData, setAlignData] = useState('Portrait');
  const [frameDimensions, setFrameDimensions] = useState('6X4')
  useEffect(() => {
    // Update frameDimensions whenever dimensions state changes
    setFrameDimensions(`${dimensions.x * 10} X ${dimensions.y * 10}`);
  }, [dimensions]);

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Frame color">
        {frameColor.name}
        <Row gutter={16}>
          {frameColors.map((item, index) => (
            <Col key={index}>
              <Button
                className={frameColor.color === item.color ? "selected" : ""}
                onClick={() => setframeColor(item)}
              >
                {item.name}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="Align" style={{ marginTop: "16px" }}>
        {alignData}
        <Row gutter={16}>
          <Col>
            <Button
              className={!Align ? "selected" : ""}
              onClick={() => { setAlign(false); setAlignData('Portrait') }}
            >
              Portrait
            </Button>
          </Col>
          <Col>
            <Button
              className={Align ? "selected" : ""}
              onClick={() => { setAlign(true); setAlignData('Landscape') }}
            >
              Landscape
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="Dimension" style={{ marginTop: "16px" }}>
        <Row gutter={16}>
          {frameDimensions}
          {dimensionsLength.map((item, index) => (
            <Col key={index}>
              <Button
                className={
                  dimensions.x === item.x && dimensions.y === item.y
                    ? "selected"
                    : ""
                }
                onClick={() => {
                  console.log("Dimension:",item);
                  setDimensions(item);
                }}
              >
                {`${item.x * 10} X ${item.y * 10}`}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="Upload Image" style={{ marginTop: "16px" }}>
        <input type="file" onChange={handleImageChange} />
        {"Rs."+amount}
      </Card>
      {/* Disable the button if FrameImage is not present */}
      <Button onClick={handleBuyNow} disabled={!FrameImage}>Buy Now</Button>
      <Button onClick={handleAddcart} disabled={!FrameImage}>Add to Cart</Button>
    </div>
  );
};

export default Configurator;
