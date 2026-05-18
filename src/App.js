import { Routes, Route } from "react-router-dom";

// PAGES
import Home from "./Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoginUser from "./pages/LoginUser";
import UserDashboard from "./pages/UserDashboard";
import Chat from "./pages/Chat";

// ADMIN
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

// THERAPISTS
import Therapist from "./pages/Therapists";
import TherapistChat from "./pages/Therapistchat.jsx";

// DOCTOR
import DoctorPanel from "./pages/DoctorPanel";
import DoctorLogin from "./pages/DoctorLogin";

function App() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login-user" element={<LoginUser />} />

      {/* USER DASHBOARD */}
      <Route path="/user-dashboard" element={<UserDashboard />} />

      {/* CHAT */}
      <Route path="/chat" element={<Chat />} />

      {/* ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* THERAPISTS */}
      <Route path="/therapists" element={<Therapist />} />

      {/* THERAPIST CHAT */}
      <Route path="/therapistchat/:sessionId" element={<TherapistChat />} />

      {/* DOCTOR */}
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/doctor" element={<DoctorPanel />} />

    </Routes>
  );
}

export default App;