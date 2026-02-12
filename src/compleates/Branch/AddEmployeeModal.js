import React, { useState, useEffect } from "react";
import api from "../../api/axios";

function AddEmployeeModal({ branchId, employee, onClose, onAdded }) {
    const [form, setForm] = useState({
        username: "",
        phone: "",
        email: "",
        password: "",
        profile_pic: null,
        is_working: true,
    });

    useEffect(() => {
        if (employee) {
            // Edit mode
            setForm({
                username: employee.username,
                phone: employee.phone,
                email: employee.email,
                password: "", // leave empty
                profile_pic: null,
                is_working: employee.is_working,
            });
        }
    }, [employee]);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (type === "file") setForm({ ...form, [name]: files[0] });
        else if (type === "checkbox") setForm({ ...form, [name]: checked });
        else setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Append only fields you want to update
        Object.keys(form).forEach((key) => {
            // Only append password if creating
            if (key === "password" && !employee) {
                data.append(key, form[key]);
            } else if (key !== "password") {
                data.append(key, form[key]);
            }
        });

        data.append("branch", branchId);

        try {
            if (employee) {
                // PATCH instead of PUT
                await api.patch(`/TFF/branch/employees/${employee.id}/edit/`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await api.post("/TFF/branch/employees/add/", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            onAdded(); // refresh employee list
            onClose();
        } catch (err) {
            console.error(err.response?.data || err);
            alert("Error saving staff");
        }
    };


    return (
        <div
            className="modal-backdrop"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1050,
            }}
            onClick={onClose}
        >
            <div
                className="modal-content p-4 bg-white rounded shadow"
                style={{ width: "400px", maxWidth: "90%" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h5 className="mb-3">{employee ? "Edit Staff" : "Add Staff"}</h5>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {!employee && (
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    )}
                    <input
                        type="file"
                        name="profile_pic"
                        onChange={handleChange}
                        className="form-control"
                    />
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="is_working"
                            checked={form.is_working}
                            onChange={handleChange}
                            className="form-check-input"
                            id="isWorkingCheck"
                        />
                        <label className="form-check-label" htmlFor="isWorkingCheck">
                            Working
                        </label>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                            {employee ? "Update" : "Add"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEmployeeModal;
