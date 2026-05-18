import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CONFIG from "../config";

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
        `${CONFIG.BASE_URL}/api/therapist/doctor-login`,
        {
          email,
          password,
        }
      );

      if (res.data.success) {
        localStorage.setItem(
          "doctor",
          JSON.stringify(res.data.doctor)
        );

        navigate("/doctor-dashboard");
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      console.log(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px" }}>
      <h1>Doctor Login</h1>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <button
        onClick={login}
        disabled={loading}
        style={{
          padding: "10px",
          width: "100%",
          cursor: "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default DoctorLogin;