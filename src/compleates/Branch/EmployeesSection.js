import React, { useState, useEffect } from "react";
import api, { BACKEND_URL } from "../../api/axios";
import AddEmployeeModal from "./AddEmployeeModal";

function EmployeesSection() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [editingEmployee, setEditingEmployee] = useState(null); // null = add mode
    const [showModal, setShowModal] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const branchId = user?.branch_id;

    // Fetch only employees of this branch
    const fetchEmployees = async () => {
        try {
            const res = await api.get("/TFF/branch/employees/", {
                params: { branch_id: branchId },
            });
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (branchId) fetchEmployees();
    }, [branchId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this staff?")) return;
        try {
            await api.delete(`/TFF/branch/employees/${id}/delete/`);
            fetchEmployees();
        } catch (err) {
            console.error(err);
            alert("Error deleting staff");
        }
    };

    const toggleWorking = async (id, current) => {
        try {
            await api.patch(`/TFF/branch/employees/${id}/toggle-working/`, {
                is_working: !current,
            });
            fetchEmployees();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredEmployees = employees.filter((emp) =>
        emp.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Search & Add */}
            <div className="d-flex justify-content-between mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Search by name or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {user?.role === "branch_manager" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingEmployee(null); // Add mode
                            setShowModal(true);
                        }}
                    >
                        Add Staff
                    </button>
                )}
            </div>

            {/* Employee Cards */}
            <div className="row g-3">
                {filteredEmployees.map((emp) => (
                    <div className="col-12 col-md-4 " key={emp.id}>
                        <div className="p-2 shadow-lg text-center text-light rounded-4" style={{backgroundColor: "rgba(12, 12, 98, 0.78)"}}>
                            <div className="d-flex">
                                <img
                                    src={`${BACKEND_URL}${emp.profile_pic}` || "/default-avatar.png"}
                                    alt={emp.username}
                                    className="img-fluid rounded-circle"
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                                <div className="m-auto">
                                    <h6 className="brand-title">{emp.username}</h6>
                                    <p className="mb-1">
                                        <b>Role: </b>{emp.role} <br />
                                        <b>Phone:</b> {emp.phone} <br />
                                        <b>Email:</b> {emp.email}
                                    </p>
                                </div>
                            </div>

                            {emp.role === "staff" && user?.role === "branch_manager" && (
                                <div className="d-flex justify-content-center gap-2 align-items-center mt-3">
                                    <button
                                        className="btn btn-sm btn-warning"
                                        onClick={() => {
                                            setEditingEmployee(emp); // Edit mode
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(emp.id)}
                                    >
                                        Delete
                                    </button>

                                    <div className="form-check form-switch ms-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={emp.is_working}
                                            onChange={() => toggleWorking(emp.id, emp.is_working)}
                                        />
                                        <label className="form-check-label">Working</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <AddEmployeeModal
                    branchId={branchId}
                    employee={editingEmployee} // null = add, object = edit
                    onClose={() => setShowModal(false)}
                    onAdded={fetchEmployees}
                />
            )}
        </div>
    );
}

export default EmployeesSection;
