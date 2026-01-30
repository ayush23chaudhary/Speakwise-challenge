import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaArrowRight } from 'react-icons/fa';
import { challengeAPI } from '../../services/api';
import ProgressIndicator from '../common/ProgressIndicator';

const ChallengeRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For mobile, only allow digits
    if (name === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!formData.mobile) {
      setError('Please enter your mobile number');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if mobile already exists
      const checkResponse = await challengeAPI.checkMobile(formData.mobile);
      
      if (checkResponse.data.exists) {
        setError('❌ You have already submitted your response.');
        setLoading(false);
        return;
      }

      // Register participant
      const response = await challengeAPI.register(formData);
      
      if (response.data.success) {
        // Navigate to recording studio
        navigate(`/record/${response.data.participantId}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-accent-teal transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <ProgressIndicator currentStep={1} />
      </div>

      {/* Registration Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 animate-fadeIn">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Register for Challenge
            </h1>
            <p className="text-text-secondary text-lg">
              Enter your details to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> You can only submit once per mobile number. Make sure to complete your recording after registration.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder=""
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-text-primary mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                  +91
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="input-field pl-24"
                  placeholder=""
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Enter your 10-digit mobile number (starting with 6-9)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 border-2 mr-2"></div>
                  Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Continue to Recording
                  <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-text-secondary">
            <p>By registering, you agree to participate in the SpeakWise Challenge</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChallengeRegistration;
