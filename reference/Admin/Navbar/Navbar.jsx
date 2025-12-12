import { Layout, Menu, Breadcrumb, Button, Popover, Descriptions, Flex, FloatButton,  List, Avatar } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined ,CustomerServiceOutlined,CommentOutlined,} from '@ant-design/icons';
import axios from "axios";
const Navbar = ({ children, setIsLoggedIn }) => {
    const [userData, setAdminData] = useState({ name: 'Pradeep T', id: '111111', phoneNo: '1234567890' });
    const { Header, Content } = Layout;
    const navigate = useNavigate();
    const [current, setCurrent] = useState(window.location.pathname.replace(/^\/Admin/, ''));
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get('https://studio-backend-sigma.vercel.app/admin/profile', { withCredentials: true });
                if (response.data.success) {
                    setIsLoggedIn(true);
                    setAdminData(response.data.user);
                } else {
                    setIsLoggedIn(false);
                    console.error('Failed to fetch user data:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchAdminData();
    }, []);
    

    const handleLogout = async () => {
        try {
            const response = await axios.put('https://studio-backend-sigma.vercel.app/admin/logout',{}, { withCredentials: true });
            if (response.data.success) {
                setIsLoggedIn(false);
                navigate('/Admin/login');
            } else {
                console.error('Logout failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <>
            <Layout style={{zIndex:'5'}}>
                <Header style={{ 
            background:'inherit',background:'inherit', position: 'sticky', justifyContent: 'space-between', top: 0, zIndex: 1, width: '100%', display: 'flex', alignItems: 'center' , background:'white'}}>
                    <Menu mode="horizontal" selectedKeys={current} style={{ width: '50%' }} defaultSelectedKeys={['2']}
                        onClick={(e) => { setCurrent(e.key); }}>
                        {[{ key: 'Dashboard', label: 'Dashboard', link: '/Dashboard' },
                        { key: 'Calendar', label: 'Calendar', link: '/Calendar' },
                        { key: 'Orders', label: 'Orders', link: '/Orders' }].map(item => (
                            <Menu.Item key={item.link}>
                                <Link to={'/Admin' + item.link}>{item.label}</Link>
                            </Menu.Item>
                        ))}
                    </Menu>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item><a href='/Admin/Dashboard'>Admin</a></Breadcrumb.Item>
                        <Breadcrumb.Item>{current.substring(1)}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{ paddingLeft: '50px' }}>
                        <Popover placement="bottom" trigger="click" content={
                            <div style={{ width: '300px' }}>
                                <Descriptions bordered column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }} title="Admin Info">
                                    <Descriptions.Item label="Admin Name">{userData.username}</Descriptions.Item>
                                </Descriptions>
                                <Flex justify='space-around'>
                                    <Button>Dark Mode</Button>
                                    <Button onClick={handleLogout}>Logout</Button>
                                </Flex>
                            </div>
                        }>
                            <Button><UserOutlined /></Button>
                        </Popover>
                    </div>
                </Header>
                <Content>
                    <div style={{ minHeight: '90vh', borderRadius: '16px' }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </>
    );
};

export default Navbar;
