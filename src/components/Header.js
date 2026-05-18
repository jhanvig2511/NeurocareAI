import { Link } from "react-router-dom";
import { FaUser, FaUserShield, FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">NeuroCare</div>

      <input
        className="search"
        placeholder="Search for support, therapists, help..."
      />

      <div className="actions">
        <div className="login-dropdown">
          <button onClick={() => setOpen(!open)}>
            Login <FaChevronDown />
          </button>

          {open && (
            <div className="dropdown">
              <Link to="/login/user">
                <FaUser /> User Login
              </Link>
              <Link to="/login/admin">
                <FaUserShield /> Admin Login
              </Link>
            </div>
          )}
        </div>

        <Link to="/register" className="register-btn">
          Register
        </Link>
      </div>
    </header>
  );
}