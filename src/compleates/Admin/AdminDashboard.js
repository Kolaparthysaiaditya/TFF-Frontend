import React, { useState, useEffect } from "react";
import axios from "axios";
import api, { BACKEND_URL } from "../../api/axios"
import "../../css/dashboard.css";
import Itemalt from "../../images/item-alt.png";
import DashboardNav from "../common/DashboardNav";
import FoodCard from "../common/FoodCard";
import ToggleSwitch from "../common/ToggleSwitch";
import FormatIndianNumber from "../../Utilies/FormatIndianNumber";
import Branches from "./Branches";
import Employess from "./Employess";
import ProfilePage from "../../Utilies/ProfilePage";
import Offers from "./Offers";
import GodownItems from "./GodownItems";
import AllBranchessStocks from "./AllBranchessStocks";
import Summery from "./Summery";

/* ================= Sidebar ================= */
function Sidebar({ setDisplay, currentSection, isOpen, closeSidebar }) {
  const navItems = [
    { key: "home", icon: "bi bi-windows", label: "Dashboard" },
    { key: "branches", icon: "bi bi-diagram-3", label: "Branches" },
    { key: "employees", icon: "bi bi-people-fill", label: "Employees" },
    { key: "menuitems", icon: "bi bi-list-ul", label: "Menu Items" },
    { key: "offers", icon: "bi bi-person-fill", label: "Offers" },
    { key: "godown", icon: "bi bi-box2-fill", label: "Godown Stock" },        // ✅ New
    { key: "branch_stock", icon: "bi bi-building", label: "Branch Stock" },
    { key: "reports", icon: "bi bi-file-earmark-text", label: "Sammury Reports" },
    { key: "profile", icon: "bi bi-person-fill", label: "Profile" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "show" : ""}`}>
      <ul className="nav nav-pills flex-column gap-2">
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

      {/* Logout (Mobile / Collapsed Menu Only) */}
      <div className="mt-auto pt-3 d-md-none">
        <button
          className="btn btn-danger w-100"
          onClick={() => {
            localStorage.clear();
            closeSidebar();
            window.location.href = "/";
          }}
        >
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </aside>
  );
}

/* ================= Dashboard Card ================= */
function DashboardCard({ title, value, icon, onClick, }) {
  return (
    <div className="col-sm-6 col-lg-3" role="button"
      onClick={onClick}>
      <div className="card shadow-sm h-100">
        <div className="card-body row">
          <div className="col-7 text-center mt-auto">
            <p className="text-muted fs-5 fw-semibold">{title}</p>
            <h4 className="fw-bold">{value}</h4>
          </div>
          <div className="col-5">
            <i className={`bi ${icon} text-primary float-end`} style={{ fontSize: "400%" }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Admin Dashboard ================= */
function AdminDashboard() {

  const [search, setSearch] = useState("");
  const [foodType, setFoodType] = useState("all");
  const [display, setDisplay] = useState("home");
  const [menuItems, setMenuItems] = useState([]);
  const [todayOffer, setTodayOffer] = useState([]);
  const [status, setStatus] = useState("all");
  const user = JSON.parse(localStorage.getItem("user"));
  const [godownStock, setGodownStock] = useState([]);
  const options = [
    { label: "Act", value: "act", colorClass: "btn-success" },
    { label: "All", value: "all", colorClass: "btn-warning" },
    { label: "Not", value: "not", colorClass: "btn-danger" },
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leadingBranch, setLeadingBranch] = useState(null);
  const [counts, setCounts] = useState({
    branches: 0,
    employees: 0,
    godowns: 0,
    orders: 0,
  });

  const fetchTodayOffer = async () => {
    try {
      const res = await api.get("/TFF/today/offer/");
      console.log("hsjj", res.data)
      setTodayOffer(res.data[0] || null);
    } catch (err) {
      console.error("Today offer fetch error", err);
      setTodayOffer(null);
    }
  };
  const fetchLeadingBranch = async () => {
    try {
      const res = await api.get("/TFF/branches/leading/");
      setLeadingBranch(res.data);
    } catch (err) {
      console.error("Failed to fetch leading branch:", err);
      setLeadingBranch(null);
    }
  };

  useEffect(() => {
    fetchTodayOffer()
    fetchLeadingBranch()
  }, [])

  // fetch godown stock
  const fetchGodownStock = async () => {
    try {
      const res = await api.get("/TFF/godown/stock/");
      setGodownStock(res.data);
    } catch (err) {
      console.error("Godown fetch error", err);
      setGodownStock([]);
    }
  };

  // Call these on mount or when sidebar switches
  useEffect(() => {
    if (display === "godown") fetchGodownStock();
  }, [display]);


  useEffect(() => {
    // Function to fetch menu items
    const fetchMenu = async () => {
      try {
        const params = {
          search,
          type: foodType,
        };

        // status → is_active mapping
        if (status === "act") {
          params.is_active = "true";
        } else if (status === "not") {
          params.is_active = "false";
        }
        // status === "all" → don't send is_active

        const res = await api.get(`/TFF/admin/menu/`, { params });
        setMenuItems(res.data);
      } catch (err) {
        console.error("Menu fetch error", err);
        setMenuItems([]);
      }
    };
    // Function to fetch dashboard counts
    const fetchCounts = async () => {
      try {
        const res = await api.get('/TFF/dashboard-counts/'); // ✅ absolute path
        const data = res.data.data;
        setCounts({
          branches: Number(data.branches),
          employees: Number(data.employees),
          menuitems: Number(data.menuitems),
          orders: Number(data.orders),
        });
      } catch (err) {
        console.error("Dashboard counts fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    fetchMenu();
    fetchTodayOffer();
  }, [search, foodType, status]); // only depends on search & foodType

  const logout = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const Eid = user.eid;
    console.log("Logging out user ID:", Eid);

    try {
      await api.post("/TFF/customer/logout/", { Eid: Eid });
      console.log("Logged out successfully");
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="bg-light min-vh-100">
      <DashboardNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar (Desktop) */}
          <div className="col-md-2 p-0 d-none d-md-block">
            <Sidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={true}
              closeSidebar={() => setSidebarOpen(false)}
            />
          </div>

          {/* Sidebar (Mobile) */}
          {sidebarOpen && (
            <div
              className="sidebar-overlay d-md-none"
              onClick={() => setSidebarOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Sidebar
                  setDisplay={setDisplay}
                  currentSection={display}
                  isOpen={sidebarOpen}
                  closeSidebar={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* ================= Main Content ================= */}
          <main className="col-md-10 dashboard-content">
            {/* HOME */}
            {display === "home" &&
              (loading ? (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="row g-3">
                  <DashboardCard
                    title="Total Branches"
                    value={counts.branches}
                    icon="bi-diagram-3"
                    onClick={() => setDisplay("branches")}
                  />
                  <DashboardCard
                    title="Employees"
                    value={counts.employees}
                    icon="bi-people"
                    onClick={() => setDisplay("employees")}
                  />
                  <DashboardCard
                    title="Menu Items"
                    value={counts.menuitems}
                    icon="bi-list-ul"
                    onClick={() => setDisplay("menuitems")}
                  />
                  <DashboardCard
                    title="Orders"
                    value={counts.menuitems}
                    icon="bi-bag-check"
                    onClick={() => setDisplay("branches")}
                  />

                  {/* Today's Offer Card (Admin View) */}
                  <div className="col-sm-12 col-lg-6" onClick={() => setDisplay("offers")} >
                    <div
                      className="card shadow-sm text-white overflow-hidden"
                      style={{ minHeight: "260px" }}
                    >
                      {todayOffer ? (
                        <div
                          className="position-relative w-100"
                          style={{
                            minHeight: "340px",
                            backgroundImage: `url(${BACKEND_URL}${todayOffer.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Dark overlay */}
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ background: "rgba(0,0,0,0.35)" }}
                          ></div>

                          {/* Offer label */}
                          <span
                            className="badge rounded-pill position-absolute top-0 start-0 m-2 fs-5"
                            style={{ zIndex: 2 }}
                          >
                            TODAY OFFER
                          </span>

                          {/* Offer % */}
                          <span
                            className="badge rounded-pill position-absolute top-0 end-0 m-2 p-3 "
                            style={{ background: "rgba(220,184,6,0.6)", zIndex: 2 }}
                          >
                            {todayOffer.display_text}
                          </span>

                          {/* Bottom content */}
                          <div
                            className="position-absolute bottom-0 start-0 w-100 p-3"
                            style={{
                              zIndex: 2,
                              background:
                                "linear-gradient(to top, rgba(50, 77, 91, 0.85), rgba(25, 27, 26, 0.12))",
                            }}
                          >
                            <h5 className="fw-bold fs-4 mb-2"><i>{todayOffer.item_name}</i></h5>
                            <p className="mb-3 fs-6 small">{todayOffer.item_description}</p>
                          </div>
                        </div>
                      ) :
                        (<p className="text-dark">no order</p>)
                      }
                    </div>
                  </div>


                  {/* Leading Branch */}
                  {/* Leading Branch */}
                  <div className="col-sm-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3">Leading Branch</h5>

                        {leadingBranch ? (
                          <>
                            <div className="row mb-4">
                              <div className="col-6">
                                <p className="mb-0">
                                  <strong>Manager:</strong> <i>{leadingBranch.branch_manager}</i>
                                </p>
                                <p className="mb-1">
                                  <strong>Branch:</strong> <i>{leadingBranch.branch_name}</i>
                                </p>
                                <p className="mb-0">
                                  <strong>Code:</strong> <i>{leadingBranch.branch_code}</i>
                                </p>
                              </div>

                              <div className="col-6 text-end">
                                <span className="badge bg-success fs-6">
                                  ₹{FormatIndianNumber(leadingBranch.current_month_sales)}
                                </span>
                                <div className="small text-muted">
                                  {leadingBranch.current_month_name}
                                </div>
                              </div>
                            </div>

                            {/* Dynamic progress bars */}
                            {[leadingBranch.previous_month_sales, leadingBranch.current_month_sales].map((value, i) => {
                              const monthName = i === 0 ? leadingBranch.previous_month_name : leadingBranch.current_month_name;
                              const maxSale = Math.max(leadingBranch.previous_month_sales, leadingBranch.current_month_sales);
                              const minSale = Math.min(leadingBranch.previous_month_sales, leadingBranch.current_month_sales);

                              let barClass = "bg-primary";
                              if (value === maxSale) barClass = "bg-success";
                              else if (value === minSale) barClass = "bg-warning";

                              const percent = (value / maxSale) * 100;

                              return (
                                <div key={i} className="mb-3">
                                  <div className="d-flex justify-content-between">
                                    <span className="fw-semibold">{monthName}</span>
                                    <span className="text-muted">₹{FormatIndianNumber(value)}</span>
                                  </div>
                                  <div className="progress bg-secondary rounded-5" style={{ height: "2vh" }}>
                                    <div className={`progress-bar ${barClass} rounded-5`} style={{ width: `${percent}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <p className="text-muted">Loading leading branch...</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}

            {/* BRANCHES */}
            {display === "branches" && (
              <Branches />
            )}

            {/* EMPLOYEES */}
            {display === "employees" && (
              <Employess />
            )}

            {/* INVENTORY */}
            {display === "menuitems" && (
              <>
                {/* INVENTORY */}
                {display === "menuitems" && (
                  <>
                    <div className="row g-2 mb-3 align-items-center">

                      {/* Veg / Non-Veg */}
                      <div className="col-12 col-md-12 col-lg-6 row gap-2">
                        <button
                          type="button"
                          className={`col-2 btn ${foodType === "veg" ? "btn-success" : "btn-outline-success"}`}
                          onClick={() => setFoodType(foodType === "veg" ? "all" : "veg")}
                        >
                          <i className="bi bi-circle-fill"></i> Veg
                        </button>

                        <button
                          className={`col-3 btn ${foodType === "nonveg" ? "btn-danger" : "btn-outline-danger"}`}
                          onClick={() => setFoodType(foodType === "nonveg" ? "all" : "nonveg")}
                        >
                          <i className="bi bi-circle-fill"></i> Non-Veg
                        </button>

                        <ToggleSwitch
                          options={options}
                          selected={status}
                          onChange={setStatus}
                        />
                      </div>



                      {/* Search */}
                      <div className="col-12 col-md-5  col-lg-4">
                        <div className="input-group">
                          <span className="input-group-text bg-white">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search food..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Add Menu */}
                      <div className="col-12 col-md-4 col-lg-2 text-md-end">
                        <button className="btn btn-primary w-100 w-md-auto d-flex align-items-center justify-content-center gap-2">
                          <i className="bi bi-plus-lg"></i>
                          <span>Add Menu</span>
                        </button>
                      </div>

                    </div>

                    {/* Menu Cards */}
                    <div className="row g-3">
                      {menuItems.length > 0 ? (
                        menuItems.map((item) => (
                          <FoodCard key={item.id} item={item} />
                        ))
                      ) : (
                        <p className="text-muted">No items available</p>
                      )}
                    </div>
                  </>
                )}

              </>
            )}

            {display === "offers" && (
              <div>
                <Offers eid={user?.eid} />
              </div>
            )}
            {display === "godown" && (
              <GodownItems godownStock={godownStock} />
            )}


            {display === "branch_stock" && (
              < AllBranchessStocks />
            )}


            {/* REPORTS */}
            {display === "reports" && (
              <Summery />
            )}

            {/* PROFILE */}
            {display === "profile" && (
              <ProfilePage />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
