import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; 
import bgImage from "./assets/dashboard.jpg"; // ✅ Imported background image

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    userType: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);

      // Save token if you still want it stored
      localStorage.setItem("jwtToken", res.data.jwtToken);

      // Show success message
      setMessage("Sign up successful! Please login.");

      // Clear form
      setForm({ name: "", mobile: "", email: "", userType: "", password: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div
      className="signup-wrapper"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column", // 👈 stack heading + form vertically
        justifyContent: "center",
        alignItems: "center",
      }}
    >

        {/* ✅ New heading */}
      <h1 className="signup-heading">
        Central Marine Fisheries Research Institute (CMFRI) Welcomes You
      </h1>

      {/* Overlay for readability */}
      <div className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="signup-input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="signup-input"
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
          <input
            className="signup-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="signup-input"
            name="userType"
            placeholder="User Type"
            value={form.userType}
            onChange={handleChange}
            required
          />
          <input
            className="signup-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="signup-button" type="submit">Sign Up</button>
        </form>

        <p className="signup-message">{message}</p>

        <p className="signup-footer">
          Already have an account?
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
