import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../../css/dashboard.css";

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const logout = async () => {
  const user = getUser();
  if (!user) return;

  try {
    await api.post("/TFF/customer/logout/", { customer_id: user.id });
  } catch (err) {
    console.error("Logout failed", err);
  }

  localStorage.clear();
  window.location.href = "/login/";
};

/* ================= Navbar ================= */
function Nav({ toggleSidebar, branchName, user }) {
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

        {/* Brand */}
        <h1 className="brand-title mb-0">Kitchen Dashboard</h1>

        {/* Branch + Login (Desktop) */}
        <div className="text-start text-light d-none d-md-block">
          <div className="d-flex ">
            <small className="opacity-75 mt-auto">Branch:</small>
            <div className="fs-6 fw-semibold ms-2">{branchName}</div>
          </div>

          <hr className="border-light opacity-50 my-1" />

          {user ? (
            <div className="mt-1 d-flex">
              <small className="opacity-75 m-auto me-2">{user?.name}</small>
              <button
                className="btn btn-outline-danger p-1 px-2 text-decoration-none"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

/* ================= Sidebar ================= */
function Sidebar({ setDisplay, currentSection, isOpen, closeSidebar, branchName, user }) {
  const navigate = useNavigate();

  const navItems = [
    { key: "stats", icon: "bi bi-speedometer2", label: "Dashboard Stats" },
    { key: "currentOrders", icon: "bi bi-clock-history", label: "Current Orders" },
    { key: "orderHistory", icon: "bi bi-journal-text", label: "Order History" },
    { key: "stock", icon: "bi bi-box-seam", label: "Stock" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "show" : ""} d-flex flex-column`}>
      <ul className="nav nav-pills flex-column gap-2 flex-grow-1">
        {navItems.map((item) => (
          <li className="nav-item" key={item.key}>
            <button
              className={`nav-link text-start ${currentSection === item.key ? "active side-active" : "text-white"
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

      <div className="p-3 d-md-none mt-auto text-light">
        {user && (
          <div className="d-flex">
            <small className="opacity-75 mt-auto">User:</small>
            <div className="fw-semibold ms-2">{user?.username}</div>
          </div>
        )}

        <div className="d-flex">
          <small className="opacity-75 mt-auto">Branch:</small>
          <div className="fs-6 fw-semibold ms-2">{branchName}</div>
        </div>

        <button
          className={`btn btn-sm w-100 mt-3 ${user ? "btn-outline-warning" : "btn-outline-light"}`}
          onClick={user ? logout : () => navigate("/CustomerAuth")}
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>
    </aside>
  );
}

/* ================= Kitchen Dashboard ================= */
export default function KitchenDashboard({ branchId, branchName }) {
  const [display, setDisplay] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Nav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} branchName={branchName} user={user} />

      <div className="container-fluid mt-5 pt-5">
        <div className="row">
          {/* Sidebar Desktop */}
          <div className="col-md-2 p-0 d-none d-md-block">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={true}
              closeSidebar={() => setSidebarOpen(false)}
              branchName={branchName}
              user={user}
            />
          </div>

          {/* Sidebar Mobile */}
          {sidebarOpen && (
            <div className="sidebar-overlay d-md-none" onClick={() => setSidebarOpen(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <Sidebar
                  setDisplay={setDisplay}
                  currentSection={display}
                  isOpen={sidebarOpen}
                  closeSidebar={() => setSidebarOpen(false)}
                  branchName={branchName}
                  user={user}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="col-md-10 dashboard-content p-3">
            {display === "stats" && <KitchenStats branchId={branchId} />}
            {display === "currentOrders" && <KitchenCurrentOrders branchId={branchId} />}
            {display === "orderHistory" && <KitchenOrderHistory branchId={branchId} />}
            {display === "stock" && <KitchenStock branchId={branchId} />}
          </main>
        </div>
      </div>
    </div>
  );
}
