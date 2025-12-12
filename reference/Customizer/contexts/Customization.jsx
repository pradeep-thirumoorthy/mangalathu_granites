import { createContext, useContext, useState } from "react";
import sampleimage from '../components/image.jpg';
const chairColors = [
  {
    color: "#683434",
    name: "brown",
  },
  {
    color: "#1a5e1a",
    name: "green",
  },
  {
    color: "#659994",
    name: "blue",
  },
  {
    color: "#896599",
    name: "mauve",
  },
  {
    color: "#ffa500",
    name: "orange",
  },
  {
    color: "#59555b",
    name: "grey",
  },
  {
    color: "#222222",
    name: "black",
  },
  {
    color: "#ececec",
    name: "white",
  },
];

const frameColors = [
  {
    color: "#683434",
    name: "brown",
  },
  {
    color: "#1a5e1a",
    name: "green",
  },
  {
    color: "#659994",
    name: "blue",
  },
  {
    color: "#896599",
    name: "mauve",
  },
  {
    color: "#ffa500",
    name: "orange",
  },
  {
    color: "#59555b",
    name: "grey",
  },
  {
    color: "#222222",
    name: "black",
  },
  {
    color: "#ececec",
    name: "white",
  },
];
const dimensionsLength = [
  {
    x: 0.6,
    y: 0.4,
  },
  {
    x: 0.8,
    y: 0.6,
  },
  {
    x: 1.0,
    y: 0.4,
  },{
    x: 1.0,
    y: 1.4,
  },

];

const CustomizationContext = createContext({});

export const CustomizationProvider = (props) => {
  const [material, setMaterial] = useState("leather");
  const [Align, setAlign] = useState(false);
  const [chairColor, setChairColor] = useState(chairColors[0]);
  const [frameColor, setframeColor] = useState(frameColors[0]);
  const [dimensions, setDimensions] = useState(dimensionsLength[0]);
  const [image,setImage] = useState(sampleimage);
  return (
    <CustomizationContext.Provider
      value={{
        material,
        setMaterial,
        Align,
        setAlign,
        chairColors,
        chairColor,
        setChairColor,
        frameColors,
        frameColor,
        setframeColor,
        dimensions,
        dimensionsLength,
        setDimensions,
        setImage,
        image,
      }}
    >
      {props.children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  return context;
};
