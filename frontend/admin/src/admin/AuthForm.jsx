import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, registerAdmin } from '@smart-park/shared/services/api';
import './auth.css';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', username: '', password: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔐 LOGIN
  const handleLogin = async () => {
  try {
    const data = await loginAdmin(
      formData.email,
      formData.password,
    );

    if (data.token) {
      localStorage.setItem("token", data.token);
      const user = data.user || {};
      localStorage.setItem("user", user.username ?? "");
      localStorage.setItem("email", user.email ?? "");
      localStorage.setItem("user_id", user.id ?? "");
      localStorage.setItem("role", user.role ?? "");
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    if (err.response?.status === 403) {
      alert("Your account is waiting for approval by the super admin.");
    }
    else{
    alert("Login failed");
  }
  }
};

  // 📝 REGISTER
  const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const data = await registerAdmin(
      formData.email,
      formData.password,
      formData.username
    );

    if (data.success) {
      alert("Account created! Please login.");
      setIsSignUp(false);
    } else {
      alert(data.error || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Signup failed");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? "Create Account" : "Admin Login"}</h2>

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {isSignUp && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            maxLength={10}
            minLength={3}
            required
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          //minLength={8}
          maxLength={16}
          //pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$"
          required
        />

        {isSignUp && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" className="auth-button primary">
          {isSignUp ? "Sign Up" : "Login"}
        </button>

        <p className="toggle-text">
          {isSignUp ? "Already have an account?" : "No account?"}{" "}
          <span onClick={handleToggle}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}