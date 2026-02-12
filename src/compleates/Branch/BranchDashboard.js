import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/great-vibes";
import DashboardNav from "../common/DashboardNav";
import "../../css/dashboard.css";
import api, { BACKEND_URL } from "../../api/axios";
import EmployeesSection from "./EmployeesSection";
import KitchenSection from "./KitchenSection";
import Summery from "./Summery";

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
    { key: "home", icon: "bi bi-windows", label: "Dashboard" },
    { key: "employees", icon: "bi bi-people-fill", label: "Employees" },
    { key: "menuitems", icon: "bi bi-list-ul", label: "Menu Items" },
    { key: "Stock", icon: "bi bi-box", label: "Stock" },
    { key: "orders", icon: "bi bi-cart", label: "Orders" },
    { key: "summury", icon: "bi bi-clipboard2-data-fill", label: "Summury" },
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
function BranchDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [todayOffer, setTodayOffer] = useState(null);
  const [display, setDisplay] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [counts, setCounts] = useState({
    branches: 0,
    users: 0,
    godown: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  const { branchId, branchName, branchCode } = useDetectBranch();

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const [dashboard, setDashboard] = useState(null);

  const fetchBranchMenu = async () => {
    if (!branchId) return;

    setMenuLoading(true);
    try {
      const res = await api.get(`/TFF/branch/${branchId}/menu-all/`);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Menu fetch error", err);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (display === "menuitems") {
      fetchBranchMenu();
    }
  }, [display, branchId]);

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      await api.patch(
        `/TFF/branch/${branchId}/menu/${itemId}/toggle/`,
        { is_available: !currentStatus }
      );

      // Update UI instantly
      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, is_available: !currentStatus }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle error", err);
    }
  };


  const fetchTodayOffer = async () => {
    try {
      const res = await api.get("/TFF/today/offer/");
      setTodayOffer(res.data[0] || null);
    } catch (err) {
      console.error("Today offer fetch error", err);
      setTodayOffer(null);
    }
  };

  useEffect(() => {
    fetchTodayOffer();
  }, []);


  useEffect(() => {
    if (!branchId) return;

    const fetchDashboard = async () => {
      try {
        const res = await api.get("/TFF/branch/dashboard/", {
          params: { branch_id: branchId },
        });
        setDashboard(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [branchId]);


  useEffect(() => {
    if (!branchId) return;

    const fetchDashboardCounts = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/TFF/dashboard/counts/",
          { params: { branch_id: branchId } }
        );

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
  }, [branchId]);

  return (
    <div className="bg-light min-vh-100">
      <DashboardNav toggleSidebar={toggleSidebar} branchName={branchName} user={user} />

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

            {display === "home" && (
              loading || !dashboard ? (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    <DashboardCard
                      title="Employees Working"
                      value={dashboard?.counts?.employees ?? 0}
                      icon="bi-people"
                    />
                    <DashboardCard
                      title="Orders Completed Today"
                      value={dashboard?.counts?.completed_orders ?? 0}
                      icon="bi-bag-check"
                    />
                    <DashboardCard
                      title="Stock Quantity"
                      value={dashboard?.counts?.stock_quantity ?? 0}
                      icon="bi-box"
                    />
                  </div>
                  {todayOffer && (
                    <div className="col-sm-12 col-lg-6">
                      <div
                        className="card shadow-sm text-white overflow-hidden"
                        style={{ minHeight: "260px", cursor: "pointer" }}
                      >
                        <div
                          className="position-relative w-100"
                          style={{
                            minHeight: "340px",
                            backgroundImage: `url(${BACKEND_URL}${todayOffer.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Overlay */}
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: "rgba(0,0,0,0.35)" }}
                          />

                          {/* Labels */}
                          <span className="badge position-absolute top-0 start-0 m-2 fs-6">
                            TODAY OFFER
                          </span>

                          <span
                            className="badge position-absolute top-0 end-0 m-2 p-2"
                            style={{ background: "rgba(220,184,6,0.6)" }}
                          >
                            {todayOffer.display_text}
                          </span>

                          {/* Bottom Info */}
                          <div
                            className="position-absolute bottom-0 start-0 w-100 p-3"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))",
                            }}
                          >
                            <h5 className="fw-bold mb-1">
                              <i>{todayOffer.item_name}</i>
                            </h5>
                            <p className="small mb-0">
                              {todayOffer.item_description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )
            )}

            {display === "menuitems" && (
              <div className="no-card-hover">
                <div className="fs-4 mb-2 fw-bold">
                    Branch Menu Availability
                  </div>
                <div className="col-12 ms-auto mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search menu items..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
                <div className="card shadow-sm">
                  <div className="card-body">
                    {menuLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-primary" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th className="text-center">Available</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMenuItems.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <img src={item.image} alt="item" className="me-3" style={{ height: "50px", width: "50px" }}></img>{item.name}
                                </td>
                                <td className="text-capitalize">{item.category}</td>
                                <td>₹{item.price}</td>
                                <td className="text-center">
                                  <div className="form-check form-switch d-inline-block">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      checked={item.is_available}
                                      disabled={user.role !== "branch_manager"}
                                      onChange={() => toggleAvailability(item.id, item.is_available)}
                                      style={{
                                        backgroundColor: item.is_available ? "#198754" : "#dc3545",
                                        borderColor: item.is_available ? "#198754" : "#dc3545",
                                      }}
                                    />
                                  </div>

                                </td>
                              </tr>
                            ))}

                            {filteredMenuItems.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center text-muted">
                                  No menu items found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {display === "employees" && (<EmployeesSection />)}

            {display === "orders" && (<KitchenSection branchId={branchCode} />)}

            {display === "summury" && (<Summery branchId={branchId}/>)}

          </main>
        </div>
      </div>
    </div>
  );
}

export default BranchDashboard;
