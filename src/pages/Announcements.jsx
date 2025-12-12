import React, { useEffect, useState } from "react";
import { Layout, Card, List, Spin, Avatar } from "antd";
import { NotificationOutlined, UserOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

const Announcements = () => {

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const userId = session?.user?.id;

  if (!userId) return;

  setLoading(true);

  fetch(`http://localhost:3010/ann?userId=${userId}`)
    .then(res => res.json())
    .then(data => {
      setAnnouncements(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);


  return (
    <Layout style={{ minHeight: "100vh" }}>

        <Card title="Latest Notices" bordered={true}>

          {loading ? (
            <Spin size="large" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={announcements}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.title}
                    description={`${new Date(item.createdAt).toLocaleString()}`}
                  />
                  <div style={{ marginTop: "5px" }}>
                    {item.content}
                    <br />
                    <strong style={{ color: "#555" }}>Audience: {item.targetAudience}</strong>
                  </div>
                </List.Item>
              )}
            />
          )}

        </Card>
    </Layout>
  );
};

export default Announcements;
