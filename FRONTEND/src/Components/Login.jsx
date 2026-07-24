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
    <div className="min-h-[85vh] flex items-center justify-center p-4 text-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Tilt Card */}
        <div className="glass-card-elevated p-8 md:p-10 border border-sky-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-sky-100 border border-sky-200 p-4 rounded-2xl mb-4 text-sky-600 shadow-xs">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-1.5 text-sm text-center">Sign in to your MaaCare hospital portal</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <Link to="/forget-password" className="text-xs text-sky-700 hover:text-sky-800 font-bold transition-colors">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-700 font-bold hover:underline">Register Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
