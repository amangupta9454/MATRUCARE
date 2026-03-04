import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Loader2, AlertCircle, Eye, EyeOff, HeartPulse } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      const { user, token } = response.data;
      login(user, token);
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      if (err.response?.data?.message === 'Please verify your email first') {
        localStorage.setItem('pendingVerificationEmail', formData.email);
        localStorage.setItem('pendingVerificationUserId', err.response.data.userId);
        navigate('/verify-otp');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card-elevated p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-teal-500/20 border border-teal-500/30 p-4 rounded-2xl mb-4">
              <HeartPulse className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Sign in to your MaaCare account</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="dark-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <Link to="/forget-password" className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="dark-input pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none mt-1"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 font-bold hover:underline">Register Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
