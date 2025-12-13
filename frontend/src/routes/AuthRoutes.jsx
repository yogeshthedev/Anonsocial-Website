import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import ChangeAvatar from "../pages/ChangeAvatar";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      <Route path="/me" element={<Profile />} />
      <Route path="/me/edit" element={<EditProfile />} />
      <Route path="/me/change-avatar" element={<ChangeAvatar />} />
    </Routes>
  );
};

export default AuthRoutes;
