import React, { useState, useEffect } from "react";
import axios from "axios";
import backgroundImg from './assets/dashboard.jpg';
// import jwtDecode from "jwt-decode"; // ✅ fixed import
import { jwtDecode } from "jwt-decode"; 
import { useNavigate } from "react-router-dom";

export default function UploadPhoto() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null); // store name
  const navigate = useNavigate();

  // Get logged-in user ID and name from JWT
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);     // JWT contains 'id'
      setUserName(decoded.name); // JWT contains 'name'
    } catch {
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Only PNG and JPG files are allowed!");
      e.target.value = null;
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
    if (!userId || !userName) return alert("User not identified!");

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("user_id", userId);
    formData.append("name", userName); // send 'name' to backend

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult({
        type: res.data.status === "matched" ? "success" : "info",
        title: res.data.title,
        message: res.data.message,
        imageBase64: res.data.imageBase64,
      });
    } catch (err) {
      console.error(err);
      setResult({ type: "error", title: "❌ Upload failed", message: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "success":
        return { border: "#28a745", bg: "#d4edda", color: "#155724" };
      case "warning":
        return { border: "#ffc107", bg: "#fff3cd", color: "#856404" };
      case "info":
        return { border: "#17a2b8", bg: "#d1ecf1", color: "#0c5460" };
      case "error":
      default:
        return { border: "#dc3545", bg: "#f8d7da", color: "#721c24" };
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
          
        </h2>

        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>

        {result && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "12px",
              borderLeft: `6px solid ${getColors(result.type).border}`,
              backgroundColor: getColors(result.type).bg,
              color: getColors(result.type).color,
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{result.title}</h3>
            <p style={{ fontSize: "15px", lineHeight: "1.6" }}>{result.message}</p>
            {result.imageBase64 && (
              <img
                src={result.imageBase64}
                alt="Uploaded"
                style={{
                  marginTop: "15px",
                  width: "80%",
                  height: "auto",
                  maxHeight: "350px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
