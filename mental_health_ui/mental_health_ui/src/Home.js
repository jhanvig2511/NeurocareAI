import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/home.css";

function Home() {
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>Your Emotional Intelligence</h1>
          <p>
            NeuroCare is a calm, confidential space where you can understand
            your emotions, reduce stress, and talk freely with an empathetic AI.
          </p>

          {/* ROLE TOGGLE */}
          <div className="role-toggle-home">
            <button
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              👤 User
            </button>

            <button
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              🛡️ Admin
            </button>
            <button onClick={() => navigate("/register")}>
               
                 Register
                </button>
          </div>
          

          {/* CTA BUTTONS */}
          <div className="cta-buttons">
            <button
              className="btn-primary"
              onClick={() =>
                navigate(role === "user" ? "/login" : "/admin/login")
              }
            >
              {role === "user" ? "User Login" : "Admin Login"}
            </button>

          </div>
        </div>
             
              
        <div className="hero-visual">
          <div className="soft-illustration">🌿</div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="why">
        <h2>Why Choose NeuroCare?</h2>

        <div className="features">
          <div className="feature-card">
            <h3>Safe & Private</h3>
            <p>Your conversations are confidential and judgment-free.</p>
          </div>

          <div className="feature-card">
            <h3>AI with Empathy</h3>
            <p>Designed to respond gently, thoughtfully, and supportively.</p>
          </div>

          <div className="feature-card">
            <h3>Track Your Well-being</h3>
            <p>Understand patterns in mood, stress, and emotional health.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;