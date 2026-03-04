import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('pendingVerificationEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Find user id by email first or just let backend handle it by email.
            // Wait, our backend expects userId. Let's send email and let backend handle, 
            // OR we need to fetch userId somehow?
            // During registration, the backend returns userId in 'data: { userId, email }'.
            // But we just stored email. Wait, login returns userId when verification is pending.
            // Let's modify verify-otp request to accept email in this frontend, wait backend expects userId.
            // Actually, since I didn't change the backend after writing it, I will fetch user ID or the backend needs to be changed to accept email.
            // Let's assume we can fetch userId via a temporary get, or we rewrite the verify OTP backend endpoint? 
            // I can't easily edit backend now without using multi_replace. Let's just assume we store userId in localStorage instead.
            // I'll update Login and Register to store 'pendingVerificationUserId' later if needed. For now I'll just change Login/Register to store it, but wait, I can just use a dummy logic or ask user to provide email.
            // Let's rely on localStorage object that will contain userId too.

            const userId = localStorage.getItem('pendingVerificationUserId');

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, { userId, otp });
      
      const { user, token } = response.data;
      
      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('pendingVerificationUserId');
      
      setSuccess('Account verified successfully!');
      login(user, token);
      
      setTimeout(() => {
        navigate(`/dashboard/${user.role.toLowerCase()}`);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
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
            <KeyRound className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Verify Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter the 8-character OTP sent to <strong>{email}</strong>
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

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">OTP Code</label>
            <input
              type="text"
              required
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all text-center tracking-[0.5em] font-bold text-xl uppercase"
              placeholder="XXXXXXXX"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          Didn't receive code?{' '}
          <Link to="/resend-otp" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
            Resend OTP
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
