import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/great-vibes";
import DashboardNav from "../common/DashboardNav";
import "../../css/dashboard.css";

/* ================= Sidebar ================= */
function Sidebar({ setDisplay, currentSection, isOpen, closeSidebar }) {
  const navItems = [
    { key: "home", icon: "bi bi-windows", label: "Dashboard" },
    { key: "branches", icon: "bi bi-diagram-3", label: "Branches" },
    { key: "employees", icon: "bi bi-people-fill", label: "Employees" },
    { key: "inventory", icon: "bi bi-box", label: "Inventory" },
    { key: "reports", icon: "bi bi-file-earmark-text", label: "Reports" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    closeSidebar();
    window.location.href = "/";
  };

  return (
    <aside className={`sidebar ${isOpen ? "show" : ""}`}>
      <ul className="nav nav-pills flex-column gap-2">
        {navItems.map((item) => (
          <li className="nav-item" key={item.key}>
            <button
              className={`nav-link text-start ${
                currentSection === item.key
                  ? "active side-active"
                  : "text-white"
              }`}
              onClick={() => {
                setDisplay(item.key);
                closeSidebar();
              }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Logout – mobile only */}
      <div className="mt-auto d-md-none">
        <button className="btn btn-danger w-100" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </aside>
  );
}

/* ================= Dashboard Card ================= */
function DashboardCard({ title, value, icon }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <p className="text-muted mb-1">{title}</p>
          <h4 className="fw-bold">{value}</h4>
          <i className={`bi ${icon} fs-3 text-primary float-end`}></i>
        </div>
      </div>
    </div>
  );
}

/* ================= Section Placeholder ================= */
function SectionCard({ title }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold text-capitalize">
        {title}
      </div>
      <div className="card-body">{title} content here</div>
    </div>
  );
}

/* ================= Admin Dashboard ================= */
function BranchDashboard() {
  const [display, setDisplay] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ✅ OPTION 2 – SAFE DEFAULT STATE */
  const [counts, setCounts] = useState({
    branches: 0,
    users: 0,
    godown: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  /* ===== Axios API Call ===== */
  useEffect(() => {
  const fetchDashboardCounts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/TFF/dashboard/counts/"
      );

      console.log("API RESPONSE:", response.data);

      const data = response.data.data;

      setCounts({
        branches: Number(data.branches),
        users: Number(data.users),
        godown: Number(data.godown),
        orders: Number(data.orders),
      });

    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardCounts();
}, []);


  return (
    <div className="bg-light min-vh-100">
      <DashboardNav toggleSidebar={toggleSidebar} />

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar (Desktop) */}
          <div className="col-md-2 p-0 d-none d-md-block">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={true}
              closeSidebar={closeSidebar}
            />
          </div>

          {/* Sidebar (Mobile) */}
          <div className="d-md-none">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={sidebarOpen}
              closeSidebar={closeSidebar}
            />
          </div>

          {/* Main Content */}
          <main className="col-md-10 dashboard-content">
            <h1>Branch Dashboard</h1>
            {display === "home" ? (
              loading ? (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="row g-3">
                  <DashboardCard
                    title="Total Branches"
                    value={counts.branches}
                    icon="bi-diagram-3"
                  />
                  <DashboardCard
                    title="Employees"
                    value={counts.users}
                    icon="bi-people"
                  />
                  <DashboardCard
                    title="Warehouses"
                    value={counts.godown}
                    icon="bi-house"
                  />
                  <DashboardCard
                    title="Orders"
                    value={counts.orders}
                    icon="bi-bag-check"
                  />
                </div>
              )
            ) : (
              <SectionCard title={display} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default BranchDashboard;
