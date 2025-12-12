import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Profile from "../pages/Profile";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      <Route path="/me" element={<Profile />} />
    </Routes>
  );
};

export default AuthRoutes;
