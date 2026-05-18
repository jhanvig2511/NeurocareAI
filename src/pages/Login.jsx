import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

/* 🌐 BACKEND URL */
const BASE_URL = "https://neurocare-backend-3k89.onrender.com";

function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email,
          password,
          role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // prevents infinite waiting
        }
      );

      if (res.data && res.data.token) {
        /* SAVE TOKEN */
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        /* REDIRECT */
        if (role === "user") {
          navigate("/user-dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        alert("Invalid server response ❌");
      }

    } catch (err) {
      console.log("Login Error:", err);

      if (err.code === "ECONNABORTED") {
        alert("Server timeout ❌ Please try again");
      } else if (err.response) {
        alert(err.response.data.message || "Invalid credentials ❌");
      } else {
        alert("Server not reachable ❌ Check backend or internet");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE */}
      <div className="login-left">
        <h1>Welcome Back 🌱</h1>
        <p>Take a breath. You’re entering a safe and supportive space.</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">

          {/* ROLE TOGGLE */}
          <div className="role-toggle">
            <button
              type="button"
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              User
            </button>

            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          <h2>{role === "user" ? "User Login" : "Admin Login"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;