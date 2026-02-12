import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function BranchMenuSection({ branchId, user }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [foodType, setFoodType] = useState("all"); // veg | nonveg | all

  const fetchBranchMenu = async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/TFF/branch/${branchId}/menu-all/`);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Menu fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchMenu();
  }, [branchId]);

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      await api.patch(
        `/TFF/branch/${branchId}/menu/${itemId}/toggle/`,
        { is_available: !currentStatus }
      );

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

  /* ================= FILTER LOGIC ================= */
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === "all" || item.category === category;

      const matchFoodType =
        foodType === "all" || item.food_type === foodType;

      return matchSearch && matchCategory && matchFoodType;
    });
  }, [menuItems, search, category, foodType]);

  const categories = [
    "all",
    ...new Set(menuItems.map(i => i.category)),
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-bold">
        Branch Menu Availability
      </div>

      <div className="card-body">
        {/* ================= FILTER BAR ================= */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search menu item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <div className="btn-group w-100">
              <button
                className={`btn btn-outline-success ${foodType === "veg" ? "active" : ""}`}
                onClick={() => setFoodType("veg")}
              >
                Veg
              </button>
              <button
                className={`btn btn-outline-danger ${foodType === "nonveg" ? "active" : ""}`}
                onClick={() => setFoodType("nonveg")}
              >
                Non-Veg
              </button>
              <button
                className={`btn btn-outline-secondary ${foodType === "all" ? "active" : ""}`}
                onClick={() => setFoodType("all")}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        {loading ? (
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
                  <th>Type</th>
                  <th>Price</th>
                  <th className="text-center">Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.image}
                        alt=""
                        className="me-2"
                        style={{ width: 45, height: 45 }}
                      />
                      {item.name}
                    </td>
                    <td className="text-capitalize">{item.category}</td>
                    <td className="text-capitalize">
                      {item.food_type}
                    </td>
                    <td>₹{item.price}</td>
                    <td className="text-center">
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={item.is_available}
                          disabled={user.role !== "branch_manager"}
                          onChange={() =>
                            toggleAvailability(item.id, item.is_available)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
