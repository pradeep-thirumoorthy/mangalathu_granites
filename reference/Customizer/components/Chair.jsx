import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useCustomization } from "../contexts/Customization";
import scf from './image.jpg';
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
function Frame(props) {

  const { Align, frameColor,dimensions ,image} = useCustomization();
  // Example dimensions (you can replace these with your own logic)
  const x = dimensions.x;
  const y = dimensions.y;



  
  const texture = useLoader(TextureLoader, image);
  const topScale = y+0.1;
  const aligner = (Align)?Math.PI / 2:0;
  console.log("aligner",Align);
  const bottomPosition = 0.5 * (y - 0.4) + 0.225;
  const rightPosition = 0.5 * (x - 0.4) + 0.225;
  console.log(x,y);
  return (
    <group {...props} dispose={null}>

      {/* Hollow frame */}
      <group position={[0, 0.5, 0]} scale={[1, 1, 1]} rotation={[-Math.PI/30, 0, aligner]}>
        {/* Top */}
        <mesh scale={[topScale,0.05,0.04]} position={[0, -rightPosition, 0]}>
          <boxGeometry />
          <meshStandardMaterial color={frameColor.color} side={THREE.DoubleSide} />
        </mesh>

        {/* Bottom */}
        <mesh scale={[topScale, 0.05, 0.04]} position={[0, rightPosition, 0]}>
          <boxGeometry />
          <meshStandardMaterial color={frameColor.color} side={THREE.DoubleSide} />
        </mesh>

        {/* Left */}
        <mesh scale={[0.05, x, 0.04]} position={[-bottomPosition, 0, 0]}>
          <boxGeometry  />
          <meshStandardMaterial color={frameColor.color} side={THREE.DoubleSide} />
        </mesh>

        {/* Right */}
        <mesh scale={[0.05, x, 0.04]} position={[bottomPosition, 0, 0]}>
          <boxGeometry/>
          <meshStandardMaterial color={frameColor.color} side={THREE.DoubleSide} />
        </mesh>

        {/* Inner cavity (cuboid) */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -aligner]}>
          <boxGeometry args={[(Align)?x:y,(Align)?y:x, 0.01]}>
          </boxGeometry>
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.01]} rotation={[0, 0, -aligner]}>
          <boxGeometry args={[(Align)?x:y,(Align)?y:x, 0.01]}>
          </boxGeometry>
          <meshStandardMaterial color={'#615d5d'} side={THREE.DoubleSide} />
        </mesh>
        

      </group>
      <mesh scale={[0.1, 0.5, 0.01]} rotation={[Math.PI/10,0,0]} position={[0, 0.4, -0.1]}>
          <boxGeometry/>
          <meshStandardMaterial color={'#615d5d'} side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
}

export default Frame;