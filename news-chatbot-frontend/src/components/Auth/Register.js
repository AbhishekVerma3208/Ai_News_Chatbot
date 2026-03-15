import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserPlus, 
  FaRobot,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2) newErrors.fullName = 'Name is too short';

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      navigate('/chat');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FaRobot className="auth-icon" />
          <h2>Create Account</h2>
          <p>Join AI News Chatbot today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
            <FaUser className="input-icon" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}

          <div className={`input-group ${errors.username ? 'error' : ''}`}>
            <FaUser className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.username && <span className="error-text">{errors.username}</span>}

          <div className={`input-group ${errors.email ? 'error' : ''}`}>
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}

          <div className={`input-group ${errors.password ? 'error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}

          <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <FaUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;