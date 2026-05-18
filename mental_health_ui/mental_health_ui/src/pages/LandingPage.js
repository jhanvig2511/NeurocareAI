import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="navbar">
        <h2 className="logo">NeuroCare</h2>

        <input
          className="search"
          placeholder="Search for support, therapists, help..."
        />

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </header>

      <section className="hero">
        <h1>Your Mental Health Matters</h1>
        <p>Confidential support, anytime, anywhere.</p>
        <Link to="/login" className="cta">Get Started</Link>
      </section>
    </div>
  );
}