import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "https://lost-and-found-management-system-9ser.onrender.com";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/api/login`, form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* 🔥 ADDED TITLE */}
        <h1 className="main-title">Lost & Found Management System</h1>
        <h2>Welcome Back 👋</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="auth-btn">Login</button>
        </form>

        <p>
          New user? <Link to="/">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;