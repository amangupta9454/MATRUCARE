import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      setUserId(response.data.userId); // Store userId for step 2
      setStep(2);
      setSuccess('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP. Email might not be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        userId,
        otp,
        newPassword
      });
      
      setSuccess('Password reset successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. OTP might be invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 dark:border-gray-700 text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-teal-100 dark:bg-teal-900/50 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Reset Password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {step === 1 ? "Enter your email to receive a password reset OTP." : "Enter the OTP and your new password."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <span className="text-left">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
            <span className="text-left">{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send OTP</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">OTP Code</label>
              <input
                type="text"
                required
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all tracking-[0.25em] font-bold text-center uppercase"
                placeholder="XXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || !newPassword}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
            </button>
          </form>
        )}

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;
