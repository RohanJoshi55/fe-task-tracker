import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", formData);

      login(data.user, data.token);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-left">
        <div className="brand-pill">
          <ShieldCheck size={18} />
          Finance Team Workspace
        </div>

        <h1>
          Manage tasks with clarity, speed, and accountability.
        </h1>

        <p>
          A secure internal task tracker built for assigning work, tracking
          progress, and keeping team activity visible.
        </p>

        <div className="auth-stats">
          <div>
            <span>3</span>
            <p>Roles</p>
          </div>
          <div>
            <span>24/7</span>
            <p>Tracking</p>
          </div>
          <div>
            <span>100%</span>
            <p>Secure API</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue to Task Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="admin@test.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;