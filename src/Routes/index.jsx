import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Login from "../Login/Login";
import Forget from "../Login/Forget";
import { getRoutesForRole } from "./RouteManager";
import { Result, Button } from "antd";

const NotFound = ({ link, content }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate(link)}>
            {content}
          </Button>
        }
      />
    </div>
  );
};

const SESSION_KEY = "userData";

const User = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  const [userRole, setUserRole] = useState(storedUser?.user?.role || null);

  const handleLoginResult = (data) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setUserRole(data.role);
    navigate(`/${data.role}`);
  };

  // -----------------------------
  // NOT LOGGED IN → PUBLIC ROUTES
  // -----------------------------
  if (!userRole) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLoginResult} />} />
        <Route path="/forgetpassword" element={<Forget />} />

        {/* 404 for public area */}
        <Route
          path="*"
          element={<NotFound link="/login" content="Go to Login" />}
        />
      </Routes>
    );
  }

  // -----------------------------
  // LOGGED IN → PRIVATE ROUTES
  // -----------------------------
  return (
    <Navbar>
      <Routes>
        {getRoutesForRole(userRole).map((r, i) => (
          <Route key={i} path={r.path} element={r.element} />
        ))}

        {/* PRIVATE 404 */}
        <Route
          path="*"
          element={<NotFound link={`/${userRole}`} content="Dashboard" />}
        />
      </Routes>
    </Navbar>
  );
};

export default User;
