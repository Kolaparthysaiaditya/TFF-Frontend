import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import "@fontsource/great-vibes";
import "../../css/dashboard.css";
import Stamp from "../../images/stamp-white.png"

function DashboardNav({ toggleSidebar, branchName, user }) {

  const logout = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const Eid = user.id;
    console.log("Logging out user ID:", Eid);

    try {
      await axios.post("/TFF/customer/logout/", { Eid: Eid });
      console.log("Logged out successfully");
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.clear();
    window.location.href = "/login/";
  };

  return (
    <nav className="navbar fixed-top navbar-dark px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* Hamburger – mobile */}
        <button
          className="navbar-toggler d-md-none border-0"
          onClick={toggleSidebar}
        >
          <i className="bi bi-list fs-2 text-white"></i>
        </button>

        {/* Logo */}
        <img
          src={Stamp}
          alt="logo"
          height="65"
          className="d-none d-md-block"
        />

        {/* Brand */}
        <h1 className="brand-title mb-0">The Food Forest</h1>

        {/* Logout – desktop */}
        <div className="d-none d-md-block">
          <p className="text-light m-0 mb-1 fs-6 text-end">
            <b>Branch:</b> {branchName}
          </p>
          <div className="d-flex justify-content-between gap-3">
            <p className="text-white m-auto float-start"><b>E-Id :</b> {user?.eid}</p>
            <button
              className="btn btn-danger float-end"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNav;
