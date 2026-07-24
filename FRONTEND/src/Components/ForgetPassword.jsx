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
            setUserId(response.data.userId);
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
        <div className="min-h-[80vh] flex items-center justify-center p-4 text-slate-800">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md glass-card-elevated p-8 md:p-10 border border-sky-200 text-center"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-sky-100 border border-sky-200 p-4 rounded-2xl mb-4 text-sky-600 shadow-xs">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        {step === 1 ? "Enter your registered email to receive a reset code." : "Enter the verification code and your new password."}
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

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6 text-left">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="dark-input"
                                placeholder="john@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/20 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Reset OTP</span>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6 text-left">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">OTP Code</label>
                            <input
                                type="text"
                                required
                                maxLength={8}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                className="dark-input tracking-[0.25em] font-bold text-center uppercase"
                                placeholder="XXXXXXXX"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="dark-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6 || !newPassword}
                            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/20 transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-sm text-slate-500 font-medium">
                    Remember your password?{' '}
                    <Link to="/login" className="text-sky-700 font-bold hover:underline">
                        Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgetPassword;
