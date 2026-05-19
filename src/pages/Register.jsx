import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

const BASE_URL = "https://neurocareai-xxrl.onrender.com";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    education: "",
    goals: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  const totalSteps = 4;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill all required fields");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/api/auth/register-complete`,
        formData
      );

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );

        localStorage.setItem(
          "userId",
          response.data.user.id
        );

        localStorage.setItem(
          "userName",
          response.data.user.name
        );

        alert("Registration Successful 🌿");

        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">

          <div className="register-header">
            <h1>Welcome to NeuroCare 🌿</h1>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="form-section">

              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="form-section">

              <label>Age</label>
              <input
                type="number"
                name="age"
                placeholder="Enter age"
                value={formData.age}
                onChange={handleChange}
              />

              <label>Gender</label>
              <input
                type="text"
                name="gender"
                placeholder="Enter gender"
                value={formData.gender}
                onChange={handleChange}
              />

              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="form-section">

              <label>Occupation</label>
              <input
                type="text"
                name="occupation"
                placeholder="Enter occupation"
                value={formData.occupation}
                onChange={handleChange}
              />

              <label>Education</label>
              <input
                type="text"
                name="education"
                placeholder="Enter education"
                value={formData.education}
                onChange={handleChange}
              />

              <label>Goals</label>
              <textarea
                name="goals"
                placeholder="Your goals"
                value={formData.goals}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="form-section">

              <label>Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyName"
                placeholder="Emergency contact name"
                value={formData.emergencyName}
                onChange={handleChange}
              />

              <label>Emergency Contact Phone</label>
              <input
                type="text"
                name="emergencyPhone"
                placeholder="Emergency contact phone"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />

            </div>
          )}

          <div className="register-footer">

            <button
              onClick={() =>
                step === 1
                  ? navigate("/")
                  : setStep(step - 1)
              }
            >
              Back
            </button>

            {step < totalSteps ? (
              <button onClick={handleNext}>
                Next
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
              >
                {loading
                  ? "Registering..."
                  : "Complete Registration"}
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}