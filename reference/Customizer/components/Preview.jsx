import { Button, Card, Col, Row, Spin } from "antd";
import { CustomizationProvider, useCustomization } from "../contexts/Customization";
import { useEffect, useState } from "react";
import Experience from "./Experience";
import { Canvas } from "@react-three/fiber";

const parseDimensionString = (dimensionString) => {
    // Split the dimensionString by 'X' and trim any whitespace
    const [xStr, yStr] = dimensionString.split('X').map(str => str.trim());
  
    // Convert the dimensions to numbers
    const x = parseFloat(xStr) / 10;
    const y = parseFloat(yStr) / 10;
  
    // Check if the conversion was successful
    if (isNaN(x) || isNaN(y)) {
        throw new Error('Invalid dimension format');
    }
  
    // Return the dimensions as a dictionary
    return { x, y };
};

const Subpreview = ({ customizationData, setLoading }) => {
    const {
        setAlign,
        setframeColor,
        setDimensions,
        setImage,
    } = useCustomization();
    
    useEffect(() => {
        setAlign(customizationData.align);
        setframeColor(customizationData.frameColor);
        setDimensions(parseDimensionString(customizationData.dimension));
        setImage(customizationData.image);
        setLoading(false); // Indicate that data loading is complete
    }, [customizationData, setAlign, setframeColor, setDimensions, setImage, setLoading]);

    return <></>; // Placeholder for rendering components within Subpreview
};

const Preview = ({ customizationData }) => {
    const [loading, setLoading] = useState(true); // Initially set loading to true

    return (
        <Spin spinning={loading} size="large"> {/* Display Spin component while loading */}
            <CustomizationProvider>
                <Canvas dpr={[1, 2]} style={{ height: '90vh' }}>
                    <color attach="background" args={["#213547"]} />
                    <fog attach="fog" args={["#213547", 10, 20]} />
                    <Experience />
                    <Subpreview customizationData={customizationData} setLoading={setLoading} />
                </Canvas>
            </CustomizationProvider>
        </Spin>
    );
};

export default Preview;
