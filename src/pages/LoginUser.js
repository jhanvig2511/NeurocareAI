import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

/* 🌐 BACKEND URL */
const BASE_URL = "https://neurocareai-xxrl.onrender.com";

function LoginUser() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email,
          password,
          role: "user",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/user-dashboard");
      } else {
        alert("Invalid login response ❌");
      }

    } catch (err) {
      console.log("Login Error:", err);

      if (err.response) {
        alert(err.response.data.message || "Invalid credentials ❌");
      } else if (err.code === "ECONNABORTED") {
        alert("Server timeout ❌ Try again");
      } else {
        alert("Server not reachable ❌ Check backend");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <h2>User Login</h2>

      <form onSubmit={handleLogin}>
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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

    </div>
  );
}

export default LoginUser;