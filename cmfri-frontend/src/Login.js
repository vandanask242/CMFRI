import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 
import bgImage from "./assets/dashboard.jpg"; // Your background image

export default function Login() {
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("jwtToken", res.data.jwtToken);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
          <input
            className="login-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="login-button" type="submit">Login</button>
        </form>
        <p className="login-message">{message}</p>
        <p className="login-footer">
          Don't have an account?
          <button type="button" onClick={() => navigate("/")}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
