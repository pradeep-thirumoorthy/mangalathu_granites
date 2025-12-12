import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Popover,
  Descriptions,
  Flex,
  message,
  Typography,
  Drawer,
  Card,
  Modal
} from "antd";

const { Text } = Typography;
const { Sider, Content, Header } = Layout;

import { Link, useNavigate, useLocation } from "react-router-dom";
import { getRoutesForRole } from "./RouteManager";

import {
  SettingOutlined,
  FileTextOutlined,
  ProjectOutlined,
  GroupOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  IdcardOutlined,
  LineChartOutlined,
  DashboardOutlined,
  TeamOutlined,
  ScheduleOutlined,
  BankOutlined,
  NotificationOutlined,
  AppstoreOutlined,
  ScanOutlined,
  CheckSquareOutlined,
  QrcodeOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  UserOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  AlertOutlined,
  MenuOutlined
} from "@ant-design/icons";

export const iconMap = {
  FileTextOutlined: <FileTextOutlined />,
  ProjectOutlined: <ProjectOutlined />,
  GroupOutlined: <GroupOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  LogoutOutlined: <LogoutOutlined />,
  IdcardOutlined: <IdcardOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  BankOutlined: <BankOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  ScanOutlined: <ScanOutlined />,
  CheckSquareOutlined: <CheckSquareOutlined />,
  QrcodeOutlined: <QrcodeOutlined />,
  FieldTimeOutlined: <FieldTimeOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  UserOutlined: <UserOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  WarningOutlined: <WarningOutlined />,
  AlertOutlined: <AlertOutlined />
};

const Navbar = ({ children, setIsLoggedIn }) => {
  const [collapsed, setCollapsed] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "User",
    lastName: "",
    role: "Guest",
    department: "Unknown"
  });

  const [chatbotOpen, setChatbotOpen] = useState(false);
const [chatInput, setChatInput] = useState("");
const [chatMessages, setChatMessages] = useState([]);


  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState("");

  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setThemeMode(newTheme);
        window.location.reload();
  };

  // Highlight menu item
  useEffect(() => {
    if (!userData?.role) return;

    let path = location.pathname;
    const rolePrefix = `/${userData.role}`;

    if (path.startsWith(rolePrefix)) {
      path = path.replace(rolePrefix, "") || "/";
    }

    const normalized = path.replace(/\/+/g, "/");
    setCurrent(normalized);
  }, [location, userData]);

  // Load user data
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("userData");
      if (!stored) return;

      const parsed = JSON.parse(stored).user;
      setUserData({
        firstName: parsed.name || parsed.firstName || "User",
        lastName: parsed.lastName || "",
        role: parsed.role || "Guest",
        department: parsed.department || "Unknown"
      });
    } catch {
      console.error("Invalid session data");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    setIsLoggedIn?.(false);
    navigate("/login");
    message.success("Logged out");
  };

  const iconWrapper = (icon, size = 26) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "30px",
        height: "30px"
      }}
    >
      {React.cloneElement(icon, { style: { fontSize: size } })}
    </div>
  );

  const menuItems = getRoutesForRole(userData.role).map((route) => {
    const normalizedKey = route.path.replace(`/${userData.role}`, "") || "/";

    return {
      key: normalizedKey,
      label: <Link to={route.path}>{route.label}</Link>,
      icon: iconWrapper(iconMap?.[route.icon] ?? <SettingOutlined />, 26)
    };
  });

  const userContent = (
  <div style={{ width: "260px" }}>
    <Descriptions bordered column={1} title="User Info" size="small">
      <Descriptions.Item label="First Name">
        {userData.firstName}
      </Descriptions.Item>
      <Descriptions.Item label="Last Name">
        {userData.lastName}
      </Descriptions.Item>
      <Descriptions.Item label="Role">{userData.role}</Descriptions.Item>
      <Descriptions.Item label="Department">
        {userData.department}
      </Descriptions.Item>
    </Descriptions>

    <Flex justify="space-around" style={{ marginTop: 12 }}>
      <Button onClick={toggleTheme}>
        {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
      </Button>
      <Button danger onClick={handleLogout}>Logout</Button>
    </Flex>
    {/* CHATBOT MODAL */}
<Modal
  open={chatbotOpen}
  
  onCancel={() => setChatbotOpen(false)}
  footer={null}
  title="Assistant"
  width={400}
>
  <div style={{ 
    height: 300, 
    overflowY: "auto", 
    padding: 8, 
    border: "1px solid #eee", 
    borderRadius: 6,
    marginBottom: 12 
  }}>
    {chatMessages.length === 0 && (
      <p style={{ opacity: 0.6 }}>Start typing to ask something...</p>
    )}

    {chatMessages.map((msg, i) => (
      <div 
        key={i} 
        style={{ 
          marginBottom: 10, 
          textAlign: msg.sender === "user" ? "right" : "left" 
        }}
      >
        <Card 
          size="small" 
          style={{ 
            display: "inline-block",
            background: msg.sender === "user" ? "#e8f3ff" : "#f7f7f7"
          }}
        >
          {msg.text}
        </Card>
      </div>
    ))}
  </div>

  <Flex gap={8}>
    <input
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      placeholder="Type a message..."
      style={{
        flexGrow: 1,
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: "8px 10px"
      }}
    />
    <Button
  type="primary"
  onClick={() => {
  if (!chatInput.trim()) return;

  // Save user message
  setChatMessages((prev) => [
    ...prev,
    { sender: "user", text: chatInput }
  ]);

  const userText = chatInput.trim().toLowerCase();
  setChatInput("");

  // Auto reply
  setTimeout(() => {
    let reply = "I'm not sure I understood that. Could you rephrase it?";

    // --- EXACT HI HANDLING ---
    if (userText.startsWith("hi")) {
      reply = "Hi, how can I help you?";
    }

    // You can add more conditions later if needed

    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: reply }
    ]);
  }, 500);
}}

>
  Send
</Button>

  </Flex>
</Modal>


    {/* CHATBOT SECTION */}
    <div style={{ marginTop: 16 }}>
      <Card
        size="small"
        title="Need Help?"
        style={{ background: "#f7faff", borderRadius: 6 }}
      >
        <p style={{ marginBottom: 12 }}>
          Chat with our assistant for quick support.
        </p>

        <Button
          type="primary"
          block
          onClick={() => {
            // frontend only, open chatbot modal or panel
            setChatbotOpen(true);
          }}
        >
          Open Chatbot
        </Button>
      </Card>
    </div>
  </div>
);


  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider
          collapsible
          theme="light"
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          collapsedWidth={80}
          style={{ height: "100vh", position: "fixed", left: 0 }}
        >
          <Text
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              paddingLeft: collapsed ? 0 : 20,
              fontSize: collapsed ? 16 : 18,
              fontWeight: "bold"
            }}
          >
            {collapsed ? "M" : "Mangalathu Granites"}
          </Text>

          <Menu mode="inline" selectedKeys={[current]} items={menuItems} />

          <div
            style={{
              position: "absolute",
              bottom: 50,
              width: "100%",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Popover trigger="click" placement="right" content={userContent}>
              <Button shape="circle" icon={<UserOutlined />} style={{ width: 50, height: 50 }} />
            </Popover>
          </div>
        </Sider>
      )}

      {/* MOBILE DRAWER MENU */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          style={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[current]}
            items={menuItems}
            onClick={() => setDrawerOpen(false)}
          />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: !isMobile ? (collapsed ? 80 : 220) : 0,
          transition: "all 0.25s ease"
        }}
      >
        {/* MOBILE TOP HEADER */}
        {isMobile && (
  <Header
    style={{
      background: 'inherit',
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // space between menu button and user icon
      height: 56
    }}
  >
    <Button icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />

    <Text style={{ marginLeft: 12, fontWeight: 600 }}>
      Mangalathu Granites
    </Text>

    {/* User circle on mobile */}
    <Popover trigger="click" placement="bottomRight" content={userContent}>
      <Button
        shape="circle"
        icon={<UserOutlined />}
        style={{ width: 40, height: 40 }}
      />
    </Popover>
  </Header>
)}

        <Content style={{ padding: isMobile ? "12px" : "24px" }}>
          <div
            style={{
              padding: isMobile ? "12px" : "24px",
              borderRadius: 12,
              minHeight: "80vh"
            }}
          >
            {children}
          </div>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default Navbar;
