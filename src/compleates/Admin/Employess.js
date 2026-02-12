import React, { useEffect, useState } from "react";
import api from "../../api/axios"
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    api
      .get(`/TFF/Employee-list/`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container p-4">Loading employees...</div>;
  }

  return (
    <div className="container-fluid p-4">
      {!selectedEmployee ? (
        <>
          <h3 className="mb-4">Employees</h3>

          {employees.map((emp) => (
            <div
              key={emp.id}
              className="card shadow-sm mb-2"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedEmployee(emp)}
            >
              <div className="card-body row">
                <div className="col-10 d-flex align-items-center">

                  {/* PROFILE PIC */}
                  <img
                    src={emp.profile_pic || "/default-user.png"}
                    alt={emp.username}
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />

                  {/* BASIC INFO */}
                  <div>
                    <h6 className="mb-1">{emp.username}</h6>

                    <small className="text-muted d-block">
                      ID: {emp.Eid}
                    </small>

                    <small className="text-muted d-block">
                      Branch: {emp.branch?.branch_code || emp.branch || "N/A"}
                    </small>
                  </div>

                </div>
                <div className="mt-1 col-2">
                  <p className="badge bg-primary me-1">
                    {emp.role}
                  </p>

                  <span
                    className={`badge ${emp.is_active ? "bg-success" : "bg-danger"
                      }`}
                  >
                    {emp.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* BACK BUTTON */}
          <button
            className="btn btn-link text-decoration-none fw-semibold fs-5 mb-3"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back
          </button>

          {/* EMPLOYEE DETAILS */}
          <div className="card shadow-sm">
            <div className="card-body">

              <div className="d-flex align-items-center mb-4">
                <img
                  src={selectedEmployee.profile_pic || "/default-user.png"}
                  alt={selectedEmployee.username}
                  className="rounded-circle me-4"
                  width="100"
                  height="100"
                />
                <div>
                  <h3 className="mb-1">{selectedEmployee.username}</h3>
                  <p className="text-muted mb-1">{selectedEmployee.Eid}</p>

                  <span
                    className={`badge ${selectedEmployee.is_active
                      ? "bg-success"
                      : "bg-danger"
                      }`}
                  >
                    {selectedEmployee.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* INFO CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Role</h6>
                      <h5>{selectedEmployee.role}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Phone</h6>
                      <h5>{selectedEmployee.phone}</h5>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Email</h6>
                      <h6 className="small">{selectedEmployee.email}</h6>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6>Branch</h6>
                      <h5>
                        {selectedEmployee.branch?.branch_code ||
                          selectedEmployee.branch ||
                          "N/A"}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="d-flex gap-2">
                <button className="btn btn-primary">Edit</button>

                <button
                  className={`btn ${selectedEmployee.is_active
                    ? "btn-danger"
                    : "btn-success"
                    }`}
                >
                  {selectedEmployee.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>

              <small className="text-muted d-block mt-3">
                Joined on:{" "}
                {new Date(
                  selectedEmployee.created_at
                ).toLocaleDateString()}
              </small>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Employees;
