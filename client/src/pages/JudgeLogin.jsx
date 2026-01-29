import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa';
import { judgeAPI } from '../services/api';

const JudgeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await judgeAPI.login(formData);
      
      if (response.data.success) {
        localStorage.setItem('judgeToken', response.data.token);
        navigate('/judge/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-feature-violet flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-accent-teal mb-8 flex items-center"
        >
          ← Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">Judge Login</h2>
            <p className="text-text-secondary">Access the admin dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 border-2 mr-2"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            <p>Only authorized judges can access this area</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeLogin;
