import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);

  const profile = {
    fullName: "Sai Aditya",
    role: "Branch Manager",
    employeeId: "EMP-1023",
    email: "aditya.kumar@company.com",
    phone: "+91 98765 43210",
    department: "Sales",
    experience: "5 Years",
    joiningDate: "12 March 2019",
    status: "Active",
    location: "Chennai",
    reportingTo: "Regional Manager",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  };

  return (
    <div className="profile-page min-vh-100" style={{ backgroundColor: "#f4f6f9" }}>
      
      {/* HEADER */}
      <div className="bg-gradient p-3  d-flex justify-content-between align-items-center">
        <h1 className="text-info"><i>Profile</i></h1>
        <button
          className="btn btn-link text-info cursor-pointer text-decoration-underline"
          onClick={() => setShowPassword(true)}
        >
          Change Password
        </button>
      </div>

      <div className="container">
        {/* PROFILE CARD */}
        <div className="card shadow-sm mb-4 border-0 rounded-3">
          <div className="card-body d-flex align-items-center gap-4">
            <img
              src={profile.avatar}
              alt="profile"
              width="120"
              height="120"
              className="rounded-circle border border-2 border-info"
            />
            <div className="flex-grow-1">
              <h4 className="fw-semibold mb-1">{profile.fullName}</h4>
              <div className="text-muted small">Employee ID: {profile.employeeId}</div>
            </div>
            <h5 className="text-info">{profile.role}</h5>
          </div>
        </div>

        {/* DETAILS */}
        <div className="row g-4">
          {/* PERSONAL INFO */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-3 p-3 h-100">
              <h6 className="text-info fw-semibold">Personal Information</h6>
              <hr className="mb-3" />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Location" value={profile.location} />
              <Info label="Status" value={profile.status} />
            </div>
          </div>

          {/* WORK INFO */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-3 p-3 h-100">
              <h6 className="text-info fw-semibold">Work Information</h6>
              <hr className="mb-3" />
              <Info label="Department" value={profile.department} />
              <Info label="Experience" value={profile.experience} />
              <Info label="Joining Date" value={profile.joiningDate} />
              <Info label="Reporting To" value={profile.reportingTo} />
            </div>
          </div>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPassword && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
          onClick={() => setShowPassword(false)}
        >
          <div
            className="card shadow-lg rounded-3 p-4"
            style={{ width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-info fw-semibold mb-0">Change Password</h5>
              <button
                className="btn-close"
                onClick={() => setShowPassword(false)}
              ></button>
            </div>

            <form>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  placeholder="Current Password"
                />
                <label htmlFor="currentPassword">Current Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="New Password"
                />
                <label htmlFor="newPassword">New Password</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPassword(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-info">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-2">
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold">{value}</div>
    </div>
  );
}
