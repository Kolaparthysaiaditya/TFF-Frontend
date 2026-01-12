import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { local } from "../../Utilies/common";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../../images/stamp-white.png";
import bgVideo from "../../videos/login-bg3.mp4";

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [formData, setFormData] = useState({
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // half speed
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(`${local.baseURL}/TFF/login/`, formData);
            login(res.data);

            // 🔁 Role-based redirect
            if (res.data.user.role === "admin") {
                navigate("/AdminDashboard/");
            } else if (res.data.user.role === "branch_manager") {
                navigate("/BranchDashboard/");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Invalid phone or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-relative vh-100 w-100">
            {/* Background video */}
            <video
                ref={videoRef}
                className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                autoPlay
                loop
                muted
                src={bgVideo}
            />
            {/* Dark overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>

            {/* Centered card */}
            <div className="d-flex justify-content-center align-items-center vh-100 position-relative">
                <div
                    className="p-4 shadow-lg"
                    style={{
                        width: "100%",
                        maxWidth: 400,
                        borderRadius: "12px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    {/* Logo */}
                    <div className="text-center">
                        <img
                            src={logo}
                            alt="logo"
                            style={{
                                width: "50%",
                                height: "50%",
                                objectFit: "cover",
                                display: "block",
                                margin: "0 auto",
                            }}
                        />
                    </div>

                    {/* Heading */}
                    <h4 className="text-center mb-3 text-light brand-title">
                        Employee Login
                    </h4>

                    {/* Error */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control mb-2 rounded-5 ps-4"
                                id="floatingUsername"
                                name="phone"
                                placeholder="Phone No"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                            />
                            <label htmlFor="floatingUsername">
                                <i className="bi bi-telephone-fill ms-3"></i> Phone No
                            </label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control mb-2 rounded-5 ps-4"
                                id="floatingPassword"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                            />
                            <label htmlFor="floatingPassword">
                                <i className="bi bi-lock-fill ms-3"></i> Password
                            </label>
                        </div>

                        <div className="text-end mb-3">
                            <button className="btn btn-link text-secondary hov py-0">Forget password</button>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="btn btn-outline-primary w-100 rounded-5"
                                style={{ fontSize: "19px" }}
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
