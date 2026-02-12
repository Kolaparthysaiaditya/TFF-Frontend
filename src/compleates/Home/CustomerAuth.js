import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../api/axios"
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import bgVideo from "../../videos/login-bg2.mp4"
import bgImg from "../../images/stamp-white.png"

const CustomerAuth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const videoRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
    });

    /* 🔐 AUTO LOGIN */
    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (user && token) {
            navigate("/");
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post(`/TFF/customer/login/`, {
                phone: formData.phone,
                password: formData.password,
            });

            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("access_token", res.data.tokens.access);
            localStorage.setItem("refresh_token", res.data.tokens.refresh);
            localStorage.setItem("session_id", res.data.session_id);

            navigate("/");
        } catch (err) {
            if (err.response?.status === 403) {
                setError("Already logged in on another device");
            } else {
                setError("Invalid phone or password");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post(`/TFF/customer/register/`, formData);
            setIsLogin(true);
        } catch {
            setError("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // half speed
        }
    }, []);

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
                <div className="no-card p-4 shadow-lg" style={{ width: "100%", maxWidth: 400, borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="text-center">
                        <img
                            src={bgImg}
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
                    <h4 className="text-center mb-3 text-light brand-title">
                        {isLogin ? "Customer Login" : "Customer Register"}
                    </h4>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={isLogin ? handleLogin : handleRegister}>
                        {!isLogin && (

                            <div className="form-floating mb-3">
                                <input
                                    className="form-control mb-2 rounded-5 ps-4"
                                    placeholder="Name"
                                    name="name"
                                    onChange={handleChange}
                                    required
                                    style={{
                                        backgroundColor: "rgba(240, 237, 230, 0.5)",
                                    }}
                                />
                                <label htmlFor="floatingEmail">
                                    <i className="bi bi-person-fill ms-3"></i> User Name
                                </label>
                            </div>
                        )}

                        <div className="form-floating mb-3">
                            <input
                                type="tel"
                                className="form-control mb-2 rounded-5 ps-4"
                                placeholder="phone"
                                name="phone"
                                onChange={handleChange}
                                required
                                maxLength={10}
                                minLength={10}
                                pattern="[0-9]{10}"
                                inputMode="numeric"
                                onKeyDown={(e) => {
                                    // Allow: numbers, Backspace, Delete, Arrow keys, Tab, Enter
                                    if (
                                        !(
                                            (e.key >= "0" && e.key <= "9") ||
                                            e.key === "Backspace" ||
                                            e.key === "Delete" ||
                                            e.key === "ArrowLeft" ||
                                            e.key === "ArrowRight" ||
                                            e.key === "Tab" ||
                                            e.key === "Enter"
                                        )
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                style={{
                                    backgroundColor: "rgba(240, 237, 230, 0.5)",
                                }}
                            />
                            <label htmlFor="floatingphone">
                                <i className="bi bi-telephone-fill ms-3"></i> Contect
                            </label>
                        </div>

                        {!isLogin && (
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className="form-control mb-2 rounded-5 ps-4"
                                    placeholder="Email"
                                    name="email"
                                    onChange={handleChange}
                                    required
                                    style={{
                                        backgroundColor: "rgba(240, 237, 230, 0.5)",
                                    }}
                                />
                                <label htmlFor="floatingphone">
                                    <i className="bi bi-envelope-fill ms-3"></i> Email
                                </label>
                            </div>
                        )}

                        <div className="form-floating mb-3">
                            <input
                                className="form-control mb-3 rounded-5 ps-4"
                                placeholder="Password"
                                type="password"
                                name="password"
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor: "rgba(240, 237, 230, 0.5)",
                                }}
                            />
                            <label htmlFor="floatingphone">
                                <i className="bi bi-lock-fill ms-3"></i> Password
                            </label>
                        </div>

                        <div className="row g-2 mt-3">
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-light w-100 rounded-5"
                                    onClick={() => setIsLogin(!isLogin)}
                                >
                                    {isLogin ? "Create account" : "Have account?"}
                                </button>
                            </div>

                            <div className="col-6">
                                <button
                                    type="submit"
                                    className="btn btn-outline-primary w-100 rounded-5"
                                    disabled={loading}
                                >
                                    {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerAuth;
