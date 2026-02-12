import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/great-vibes";
import DashboardNav from "../common/DashboardNav";
import "../../css/dashboard.css";
import api, { BACKEND_URL } from "../../api/axios";
import ChefOrders from "./ChefOrders";
import CompletedOrders from "./CompletedOrders";

/* ================= Branch Detection Hook ================= */
const useDetectBranch = () => {
    const [branchName, setBranchName] = useState("Detect Branch");
    const [branchId, setBranchId] = useState(null);
    const [branchCode, setBranchCode] = useState(null)
    const [loading, setLoading] = useState(false);

    const detectBranch = () => {
        if (!navigator.geolocation) {
            setBranchName("Location Not Supported");
            return;
        }

        setLoading(true);
        setBranchName("Detecting...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);

                try {
                    const res = await api.get(
                        `/TFF/nearest-branch/?lat=${lat}&lon=${lon}`
                    );

                    if (res.data?.branch_id) {
                        setBranchId(res.data.branch_id);
                        setBranchCode(res.data.branch_code);
                        setBranchName(res.data.branch_name);
                    } else {
                        setBranchId(null);
                        setBranchName("No Nearby Branch");
                    }
                } catch (err) {
                    console.error("Branch detect error:", err);
                    setBranchName("Branch Error");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setBranchName("Location Denied");
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        detectBranch();
        const interval = setInterval(detectBranch, 60000);
        return () => clearInterval(interval);
    }, []);

    return { branchId, branchName, loading, branchCode };
};

/* ================= Sidebar ================= */
function Sidebar({ setDisplay, currentSection, isOpen, closeSidebar, branchName }) {
    const navItems = [
        { key: "orders", icon: "bi bi-fire", label: "Orders" },
        { key: "completed", icon: "bi bi-check-circle", label: "Completed Orders" },
        { key: "profile", icon: "bi bi-person-circle", label: "Profile" },
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
                            className={`nav-link text-start ${currentSection === item.key
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

            {/* Mobile branch + logout */}
            <div className="mt-auto d-md-none text-white px-2">
                <div className="d-flex mb-2">
                    <small className="opacity-75 me-2">Branch:</small>
                    <span className="fw-semibold">{branchName}</span>
                </div>

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
        <div className="col-sm-6 col-lg-3" role="button"
        >
            <div className="card shadow-sm h-100">
                <div className="card-body row">
                    <div className="col-8 text-center mt-auto">
                        <p className="text-muted fs-5 fw-semibold">{title}</p>
                        <h4 className="fw-bold">{value}</h4>
                    </div>
                    <div className="col-4">
                        <i className={`bi ${icon} text-primary float-end`} style={{ fontSize: "400%" }}></i>
                    </div>
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

/* ================= Branch Dashboard ================= */
function ChefDashboard() {
  const [display, setDisplay] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"))
  const { branchId, branchName, branchCode } = useDetectBranch();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-light min-vh-100">
      <DashboardNav
        toggleSidebar={toggleSidebar}
        branchName={branchName}
        user={user}
      />

      <div className="container-fluid">
        <div className="row">

          {/* Sidebar Desktop */}
          <div className="col-md-2 p-0 d-none d-md-block">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={true}
              closeSidebar={closeSidebar}
              branchName={branchName}
            />
          </div>

          {/* Sidebar Mobile */}
          <div className="d-md-none">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={sidebarOpen}
              closeSidebar={closeSidebar}
              branchName={branchName}
            />
          </div>

          {/* Main Content */}
          <main className="col-md-10 dashboard-content">

            {display === "orders" && (
              <ChefOrders branchCode={branchCode} Eid={user?.eid}/> 
            )}

            {display === "completed" && (
              <CompletedOrders branchCode={branchCode} Eid={user?.eid} />
            )}

            {display === "profile" && (
              <p>profile</p>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}


export default ChefDashboard;
