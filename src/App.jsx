import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import Login from "./Login/Login";
import Forget from "./Login/Forget";
import User from "./Routes/index";
import { Button, Result } from "antd";

// 404 Page Component (Fix: navigate must come from inside component)
const NotFound = ({ link, content }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{ height: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button type="primary" onClick={() => navigate(link)}>{content || "Back"}</Button>}
      />
    </div>
  );
};

const App = () => {
  const [themeMode, setThemeMode] = useState("dark");

  // Load theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setThemeMode(storedTheme);
  }, []);
  useEffect(() => {
    document.documentElement.style.backgroundColor =
      themeMode === "dark" ? "#000000" : "#ffffff";

    document.body.style.backgroundColor =
      themeMode === "dark" ? "#000000" : "#ffffff";
  }, [themeMode]);

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm:
            themeMode !== "dark"
              ? antdTheme.defaultAlgorithm
              : antdTheme.darkAlgorithm,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<Forget />} />
          <Route path="/*" element={<User />} />
          <Route path="*" element={<NotFound link={"/login"} content="Go to Login" />} />
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
