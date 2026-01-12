import axios from "axios";
import { local } from "../../Utilies/common";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/dashboard.css";
import Stamp from "../../images/stamp-white.png";
import FoodCard from "../common/FoodCard";

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const logout = async () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const customerId = user.id;
  console.log("Logging out user ID:", customerId);

  try {
    await axios.post(`${local.baseURL}/TFF/customer/logout/`, { customer_id: customerId });
    console.log("Logged out successfully");
  } catch (err) {
    console.error("Logout failed", err);
  }

  localStorage.clear();
  window.location.href = "/";
};

const useDetectBranch = () => {
  const [branchName, setBranchName] = useState("Detect Branch");
  const [branchId, setBranchId] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [LastCoords, setLastCoords] = useState({ lat: null, lon: null });

  const detectBranch = () => {
    if (!navigator.geolocation) {
      setBranchName("Location Not Supported");
      return;
    }

    setLoading(true);
    setBranchName("Detecting...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        console.log(
          "Lat:", latitude,
          "Lon:", longitude,
          "Accuracy (meters):", position.coords.accuracy
        );


        // setLastCoords({ lat: latitude, lon: longitude });
        console.log("Detected coords:", latitude, longitude);

        try {
          const res = await axios.get(
            `${local.baseURL}/TFF/nearest-branch/?lat=${latitude}&lon=${longitude}`
          );

          if (res.data?.branch_name) {
            setBranchName(res.data.branch_name);
            setBranchId(res.data.branch_id);
          } else {
            setBranchName("No Nearby Branch");
            setBranchId(null);
          }
        } catch (error) {
          console.error(error);
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
        enableHighAccuracy: true, // 🔥 disable high accuracy to avoid jitter
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    detectBranch();
    const interval = setInterval(() => {
      detectBranch();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return { branchName, branchId, loading, detectBranch };
};

/* ================= Navbar ================= */
function Nav({ toggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const { branchName } = useDetectBranch();



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
        <img src={Stamp} alt="logo" height="65" className="d-none d-md-block" />

        {/* Brand */}
        <h1 className="brand-title mb-0">The Food Forest</h1>

        {/* Branch + Login (Desktop) */}
        <div className="text-start text-light d-none d-md-block">
          <div className="d-flex ">
            <small className="opacity-75 mt-auto">Branch:</small>
            <div className="fs-6 fw-semibold ms-2">{branchName}</div>
          </div>

          <hr className="border-light opacity-50 my-1" />

          {user ? (
            <div className="mt-1 d-flex">
              <small className="opacity-75 m-auto me-2">{user.name}</small>
              <button
                className="btn btn-outline-danger p-1 px-2 text-decoration-none"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-outline-primary mt-2 w-100"
              onClick={() => navigate("/CustomerAuth")}
            >
              Login
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

/* ================= Sidebar ================= */
function CustomerSidebar({ setDisplay, currentSection, isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const user = getUser();
  const { branchName } = useDetectBranch();

  const navItems = [
    { key: "menu", icon: "bi bi-journal-text", label: "Menu" },
    { key: "currentOrder", icon: "bi bi-clock-history", label: "Current Order" },
    { key: "myOrders", icon: "bi bi-bag-check", label: "My Orders" },
    { key: "reviews", icon: "bi bi-star-fill", label: "My Reviews" },
    { key: "bills", icon: "bi bi-receipt", label: "My Bills" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "show" : ""} d-flex flex-column`}>
      {/* Navigation items */}
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

      {/* Bottom info for mobile */}
      <div className="p-3 d-md-none mt-auto text-light">
        {user && (
          <div className="d-flex">
            <small className="opacity-75 mt-auto">User:</small>
            <div className="fw-semibold ms-2">{user.name}</div>
          </div>
        )}

        <div className="d-flex">
          <small className="opacity-75 mt-auto">Branch:</small>
          <div className="fs-6 fw-semibold ms-2">{branchName}</div>
        </div>

        <button
          className={`btn btn-sm w-100 mt-3 ${user ? "btn-outline-warning" : "btn-outline-light"
            }`}
          onClick={user ? logout : () => navigate("/CustomerAuth")}
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>
    </aside>
  );
}

/* ================= Customer Dashboard ================= */
function CustomerDashboard() {
  const [display, setDisplay] = useState("menu");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [foodType, setFoodType] = useState("all");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    branchId,
  } = useDetectBranch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${local.baseURL}/TFF/menu/categories/`);
        setCategoryOptions(["all", ...res.data]); // prepend 'all'
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategoryOptions(["all"]);
      }
    };

    const fetchMenu = async () => {
      try {
        const params = {
          search,
          type: foodType,
          category: selectedCategory
        };
        if (branchId) params.branch_id = branchId; // only add branch_id if available

        const res = await axios.get(`${local.baseURL}/TFF/branch/menu/`, { params });
        setMenuItems(res.data);
      } catch (err) {
        console.error("Menu fetch error", err);
        setMenuItems([]); // clear on error
      }
    };

    fetchCategories();
    fetchMenu();
  }, [branchId, search, foodType, selectedCategory]);


  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Nav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="container-fluid mt-5 pt-5">
        <div className="row">
          {/* Sidebar Desktop */}
          <div className="col-md-2 p-0 d-none d-md-block">
            <CustomerSidebar
              setDisplay={setDisplay}
              currentSection={display}
              isOpen={true}
              closeSidebar={() => setSidebarOpen(false)}
            />
          </div>

          {/* Sidebar Mobile */}
          {sidebarOpen && (
            <div
              className="sidebar-overlay d-md-none"
              onClick={() => setSidebarOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <CustomerSidebar
                  setDisplay={setDisplay}
                  currentSection={display}
                  isOpen={sidebarOpen}
                  closeSidebar={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="col-md-10 dashboard-content p-3">
            {display === "menu" && (
              <>
                <div className="row mb-3 align-items-center g-2">
                  {/* Veg / Non-Veg Buttons */}
                  <div className="col-6 col-md-4 col-lg-3 d-flex gap-2">
                    <button
                      type="button"
                      className={`btn d-flex align-items-center ${foodType === "veg" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setFoodType(foodType === "veg" ? "all" : "veg")}
                    >
                      <i className="bi bi-circle-fill me-1"></i> Veg
                    </button>

                    <button
                      className={`btn d-flex align-items-center ${foodType === "nonveg" ? "btn-danger" : "btn-outline-danger"}`}
                      onClick={() => setFoodType(foodType === "nonveg" ? "all" : "nonveg")}
                    >
                      <i className="bi bi-circle-fill me-1"></i> Non-Veg
                    </button>
                  </div>

                  {/* Category Select */}
                  <div className="col-6 col-md-2">
                    <select
                      className="form-select btn btn-outline-secondary"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat} className="rounded-5 border border-5">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Input */}
                  <div className="col-12 col-md-6 col-lg-7">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search food..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))
                  ) : (
                    <p className="text-muted">No items available for this branch</p>
                  )}
                </div>
              </>
            )}

            {display === "currentOrder" && (
              <div className="card shadow-sm">
                <div className="card-header fw-semibold">Current Order</div>
                <div className="card-body">Your order is being prepared 🍳</div>
              </div>
            )}

            {display === "myOrders" && (
              <div className="card shadow-sm">
                <div className="card-header fw-semibold">My Orders</div>
                <div className="card-body">Order history here</div>
              </div>
            )}

            {display === "reviews" && (
              <div className="card shadow-sm">
                <div className="card-header fw-semibold">My Reviews</div>
                <div className="card-body">Your reviews will appear here</div>
              </div>
            )}

            {display === "bills" && (
              <div className="card shadow-sm">
                <div className="card-header fw-semibold">My Bills</div>
                <div className="card-body">Billing details here</div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
