import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://neurocareai-xxrl.onrender.com/api/therapist/doctor-login",
        { email, password }
      );

      if (res.data.success) {
        localStorage.setItem("doctor", JSON.stringify(res.data.doctor));
        navigate("/doctor");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.log(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h1>🩺 Doctor Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{ padding: "10px", width: "100%", cursor: "pointer" }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default DoctorLogin;