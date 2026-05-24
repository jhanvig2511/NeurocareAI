import "../styles/userDashboard.css";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div className="user-dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">NeuroCare</h2>

        <nav>
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Profile & Assessment</button>
          <button className="nav-item" onClick={() => navigate("/chat")}>
            AI Chat
          </button>
         
          <button className="nav-item">History</button>
          <button className="nav-item logout" onClick={() => navigate("/")}>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h1>Welcome back 🌿</h1>
        <p className="subtitle">
          Your mental wellness journey continues here.
        </p>

        <section className="cards">

          <div className="card">
            <h3>Mood Status</h3>
            <p>Unstable 😔</p>
          </div>

          <div className="card">
            <h3>Daily Check-ins</h3>
            <p>3-day streak</p>
          </div>

          <div className="card">
            <h3>Next Step</h3>
            <p>Complete your profile</p>
          </div>

        </section>

        <button className="chat-cta" onClick={() => navigate("/chat")}>
          Start a Conversation
        </button>
      </main>

    </div>
  );
}

export default UserDashboard;