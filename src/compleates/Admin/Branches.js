import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [idleStaff, setIdleStaff] = useState([]);


  const [formData, setFormData] = useState({
    branch_name: "",
    address: "",
    city: "",
    phone: "",
    sales: "",
    latitude: "",
    longitude: "",
    required_staff: "",
    status: "active",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [utilFilter, setUtilFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ================= FETCH =================
  const fetchBranches = async () => {
    const res = await api.get("/TFF/branches/active/");
    setBranches(res.data);
  };

  useEffect(() => {
    fetchBranches().finally(() => setLoading(false));
  }, []);

  // ================= HELPERS =================
  const utilizationPercent = (b) =>
    b.required_staff > 0
      ? Math.round((b.total_staff / b.required_staff) * 100)
      : 0;

  const excessStaff = (b) =>
    b.total_staff > b.required_staff ? b.total_staff - b.required_staff : 0;

  const shortageStaff = (b) =>
    b.total_staff < b.required_staff ? b.required_staff - b.total_staff : 0;

  // ================= FILTER LOGIC =================
  const filteredBranches = branches.filter((b) => {
    const util = utilizationPercent(b);
    const search = searchTerm.trim().toLowerCase();

    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (utilFilter === "below100" && util >= 100) return false;
    if (utilFilter === "exact100" && util !== 100) return false;
    if (utilFilter === "above100" && util <= 100) return false;

    if (search && !b.branch_name.toLowerCase().includes(search)) return false;

    return true;
  });

  // ================= FORM =================
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {

      if (isEdit) {
        await api.put(
          `/TFF/branches/${editingId}/update/`,
          formData
        );
      } else {
        await api.post("/TFF/branches/create/", formData);
      }

      setShowAddModal(false);
      setIsEdit(false);
      setEditingId(null);

      // 🔥 REFRESH LIST
      const listRes = await api.get("/TFF/branches/active/");
      setBranches(listRes.data);

      // 🔥 UPDATE DETAILS VIEW IF OPEN
      if (selectedBranch && isEdit) {
        const updated = listRes.data.find(
          (b) => b.id === selectedBranch.id
        );
        setSelectedBranch(updated);
      }

    } catch {
      alert("Failed to save branch");
    }
  };


  const handleEdit = (branch) => {
    setIsEdit(true);
    setEditingId(branch.id);
    setFormData({
      branch_name: branch.branch_name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      sales: branch.sales,
      latitude: branch.latitude,
      longitude: branch.longitude,
      required_staff: branch.required_staff,
      status: branch.status,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch permanently?")) return;

    try {
      await axios.delete(`/TFF/branches/${id}/delete/`);
      setSelectedBranch(null);
      await fetchBranches();
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Delete failed due to server error"
      );
    }
  };

  const assign = async (empId) => {
    try {
      const res = await api.post("/TFF/staff/assign/", {
        employee_id: empId,
        target_branch_id: selectedBranch.id,
      });

      if (res.data.success) {
        alert("Staff assigned successfully!");
      }

      setShowStaffModal(false);

      await fetchBranches();

      const resBranches = await api.get("/TFF/branches/active/");
      setSelectedBranch(resBranches.data.find(b => b.id === selectedBranch.id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign staff");
    }
  };





  if (loading) return <div className="container p-4">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      {!selectedBranch ? (
        <>
          {/* ================= FILTER BAR (RESTORED) ================= */}
          <div className="row mb-4 g-2">
            <div className="col-md-2">
              <button
                className="btn btn-success fw-semibold w-100"
                onClick={() => {
                  setIsEdit(false);
                  setFormData({
                    branch_name: "",
                    address: "",
                    city: "",
                    phone: "",
                    sales: "",
                    latitude: "",
                    longitude: "",
                    status: "active",
                  });
                  setShowAddModal(true);
                }}
              >
                + Add
              </button>
            </div>

            <div className="col-md-2">
              <select
                className="form-select btn btn-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select btn btn-warning"
                value={utilFilter}
                onChange={(e) => setUtilFilter(e.target.value)}
              >
                <option value="all">All Utilization</option>
                <option value="below100">Below 100%</option>
                <option value="exact100">Exactly 100%</option>
                <option value="above100">Above 100%</option>
              </select>
            </div>

            <div className="col-md-6">
              <input
                className="form-control btn btn-outline-secondary"
                placeholder="Search branch name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ================= CARDS (ORIGINAL STYLE) ================= */}
          <div className="row">
            {filteredBranches.length === 0 ? (
              <p className="text-muted text-center">No branches found</p>
            ) : (
              filteredBranches.map((branch) => {
                const util = utilizationPercent(branch);

                return (
                  <div key={branch.id} className="col-md-4 col-lg-3 mb-4">
                    <div
                      className="card shadow-sm h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h5 className="mb-1">{branch.branch_name}</h5>
                            <p className="text-muted mb-1">
                              City: <strong>{branch.city}</strong>
                            </p>
                            <h6 className="text-primary mb-0">
                              ₹{branch.sales.toLocaleString()}
                            </h6>
                          </div>

                          <span
                            className={`badge rounded-pill ${branch.status === "active"
                              ? "bg-success"
                              : "bg-danger"
                              }`}
                            style={{ height: "fit-content" }}
                          >
                            {branch.status}
                          </span>
                        </div>

                        <span
                          className={`badge mt-3 ${util > 100
                            ? "bg-info"
                            : util < 100
                              ? "bg-warning text-dark"
                              : "bg-success"
                            }`}
                        >
                          Utilization: {util}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* ================= DETAILS ================= */}
          <button
            className="btn btn-link mb-3"
            onClick={() => setSelectedBranch(null)}
          >
            ← Back
          </button>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <h3 className="brand-title text-dark fw-bold">{selectedBranch.branch_name}</h3>
                  <p className="text-muted"><span className="text-primary fw-semibold">Branch : </span>{selectedBranch.city}</p>
                  <p className='text-muted'><span className="text-primary fw-semibold">Sales : </span>{selectedBranch.sales.toLocaleString()}</p>
                </div>

                <div className="d-flex gap-2 h-25">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(selectedBranch)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(selectedBranch.id)}
                  >
                    🗑 Delete
                  </button>

                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={async () => {
                      const res = await axios.get("/TFF/staff/excess/");
                      setIdleStaff(res.data);
                      setShowStaffModal(true);
                    }}
                  >
                    👥 Manage Staff
                  </button>

                </div>
              </div>

              {/* STAFF CARDS */}
              <div className="row g-3 mt-3">
                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Total Staff</h6>
                      <h5>{selectedBranch.total_staff}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Required Staff</h6>
                      <h5>{selectedBranch.required_staff}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center border-info">
                    <div className="card-body">
                      <h6>Not Needed</h6>
                      <h5 className="text-info">
                        {excessStaff(selectedBranch)}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center border-danger">
                    <div className="card-body">
                      <h6>Shortage</h6>
                      <h5 className="text-danger">
                        {shortageStaff(selectedBranch)}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR (ONLY HERE) */}
              <div className="mt-4">
                <label className="form-label">
                  Staff Utilization:{" "}
                  <strong>{utilizationPercent(selectedBranch)}%</strong>
                </label>

                <div className="progress">
                  <div
                    className={`progress-bar ${utilizationPercent(selectedBranch) > 100
                      ? "bg-info"
                      : utilizationPercent(selectedBranch) < 100
                        ? "bg-warning"
                        : "bg-success"
                      }`}
                    style={{
                      width: `${Math.min(
                        utilizationPercent(selectedBranch),
                        150
                      )}%`,
                    }}
                  >
                    {utilizationPercent(selectedBranch)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL ================= */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ background: "#0006" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{isEdit ? "Edit Branch" : "Add Branch"}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="modal-body row g-2">

                  {/* Branch Name */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="branch_name"
                        value={formData.branch_name}
                        onChange={handleChange}
                        placeholder="Branch Name"
                        required
                      />
                      <label>Branch Name</label>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        required
                      />
                      <label>Address</label>
                    </div>
                  </div>

                  {/* City */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                      />
                      <label>City</label>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        required
                      />
                      <label>Phone</label>
                    </div>
                  </div>

                  {/* Sales */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        name="sales"
                        value={formData.sales}
                        onChange={handleChange}
                        placeholder="Sales"
                        required
                      />
                      <label>Sales</label>
                    </div>
                  </div>

                  {/* Required Staff */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        name="required_staff"
                        value={formData.required_staff}
                        onChange={handleChange}
                        placeholder="Required Staff"
                        required
                      />
                      <label>Required Staff</label>
                    </div>
                  </div>

                  {/* Latitude */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="Latitude"
                        required
                      />
                      <label>Latitude</label>
                    </div>
                  </div>

                  {/* Longitude */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="Longitude"
                        required
                      />
                      <label>Longitude</label>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                      <label>Status</label>
                    </div>
                  </div>

                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {isEdit ? "Update" : "Save"}
                  </button>
                </div>
              </form>


            </div>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="modal fade show d-block" style={{ background: "#0006" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5>Excess Staff (Available)</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowStaffModal(false)}
                />
              </div>

              <div className="modal-body">
                {idleStaff.length === 0 ? (
                  <p className="text-center text-muted">
                    No excess staff available
                  </p>
                ) : (
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Current Branch</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {idleStaff.map(emp => (
                        <tr key={emp.id}>
                          <td>{emp.name}</td>
                          <td>{emp.role}</td>
                          <td>{emp.branch_name}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => assign(emp.id)}  // <-- use emp.id, not emp.Eid
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                )}
              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Branches;
