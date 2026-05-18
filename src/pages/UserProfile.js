import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function UserProfile() {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <h2>Tell us about yourself 🌱</h2>

      <input placeholder="Full Name" />
      <input placeholder="Age" />
      <input placeholder="Gender" />
      <input placeholder="Profession / Student" />

      <select>
        <option>Stress Level</option>
        <option>Low</option>
        <option>Moderate</option>
        <option>High</option>
      </select>

      <select>
        <option>Sleep Quality</option>
        <option>Good</option>
        <option>Average</option>
        <option>Poor</option>
      </select>

      <textarea placeholder="Any mental or physical health concerns?" />

      <textarea placeholder="What are you hoping to get from this support?" />

      <button onClick={() => navigate("/chat")}>
        Continue to Chat
      </button>
    </div>
  );
}

export default UserProfile;