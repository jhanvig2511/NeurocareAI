import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Left side: Logo / App name */}
      <div className="nav-left">
        <Link to="/" className="logo">
          NeuroCare
        </Link>
      </div>

      {/* Right side: Navigation links */}
      <div className="nav-right">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link btn">
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;