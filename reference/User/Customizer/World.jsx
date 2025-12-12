import { Canvas } from "@react-three/fiber";
import Experience from "../../Customizer/components/Experience";
import Configurator from "../../Customizer/components/Configurator";
import { CustomizationProvider } from "../../Customizer/contexts/Customization";
import { Row,Col } from "antd";

function World3d() {
  return (
    <CustomizationProvider>
      <div className="" style={{height:'90vh'}}>
        <Row>
          <Col lg={{ span: 16 }} xl={{ span: 16 }} sm={{span:24}}>
            <Canvas dpr={[1, 2]} style={{height:'90vh'}}>
              <color attach="background" args={["#213547"]} />
              <fog attach="fog" args={["#213547", 10, 20]} />
              <Experience />
            </Canvas>
          </Col>
          <Col lg={{ span: 8 }} xl={{ span: 8 }} sm={{span:24}}>
            <Configurator />
          </Col>
        </Row>
      </div>
    </CustomizationProvider>
  );
}

export default World3d;
