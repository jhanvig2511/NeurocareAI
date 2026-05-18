import { useNavigate } from "react-router-dom";

export default function Questionnaire() {
  const navigate = useNavigate();

  return (
    <div className="form">
      <h2>Tell Us About You</h2>

      <input placeholder="Age" />
      <input placeholder="Profession" />
      <textarea placeholder="Current concerns" />
      <textarea placeholder="How do you usually cope with stress?" />

      <button onClick={() => navigate("/user/dashboard")}>
        Submit
      </button>
    </div>
  );
}