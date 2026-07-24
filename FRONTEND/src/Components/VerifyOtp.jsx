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
        <div className="min-h-[80vh] flex items-center justify-center p-4 text-slate-800">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md glass-card-elevated p-8 md:p-10 border border-sky-200 text-center"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-sky-100 border border-sky-200 p-4 rounded-2xl mb-4 text-sky-600 shadow-xs">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Account</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Enter the 8-character OTP sent to <strong className="text-sky-800">{email}</strong>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                        <span className="text-left">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-start">
                        <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
                        <span className="text-left">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">OTP Code</label>
                        <input
                            type="text"
                            required
                            maxLength={8}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.toUpperCase())}
                            className="dark-input text-center tracking-[0.5em] font-bold text-xl uppercase"
                            placeholder="XXXXXXXX"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/20 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
                    </button>
                </form>

                <div className="mt-8 text-sm text-slate-500 font-medium">
                    Didn't receive code?{' '}
                    <Link to="/resend-otp" className="text-sky-700 font-bold hover:underline">
                        Resend OTP
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
