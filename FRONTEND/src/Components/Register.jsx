import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, AlertCircle, UploadCloud, Eye, EyeOff, HeartPulse } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Mother',
        specialization: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            if (formData.role === 'Doctor') {
                data.append('specialization', formData.specialization);
            }
            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.status === 'PENDING') {
                localStorage.setItem('pendingVerificationEmail', formData.email);
                localStorage.setItem('pendingVerificationUserId', response.data.data.userId);
                navigate('/verify-otp');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "dark-input";
    const labelCls = "text-xs font-bold text-gray-400 uppercase tracking-wider";

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl glass-card-elevated p-8 md:p-12"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-teal-500/20 border border-teal-500/30 p-4 rounded-2xl mb-4">
                        <HeartPulse className="w-8 h-8 text-teal-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
                    <p className="text-gray-500 mt-2 text-sm text-center">Join the MaaCare maternal healthcare ecosystem.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Full Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="Jane Smith" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputCls} placeholder="jane@example.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} className={`${inputCls} pr-12`} placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Confirm Password</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className={`${inputCls} pr-12`} placeholder="••••••••" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className={inputCls}>
                                <option value="Mother">Mother (Patient)</option>
                                <option value="Doctor">Doctor</option>
                                <option value="ASHA">ASHA Worker</option>
                                <option value="Family">Family Member</option>
                            </select>
                        </div>
                        {formData.role === 'Doctor' && (
                            <div className="space-y-1.5">
                                <label className={labelCls}>Specialization</label>
                                <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className={inputCls} placeholder="E.g., Gynecologist" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Profile Image (Optional)</label>
                        <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                            <UploadCloud className="w-7 h-7 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500 font-medium">
                                {profileImage ? profileImage.name : 'Click to upload photo (SVG, PNG, JPG)'}
                            </p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus size={18} /> Create Account</>}
                    </button>
                </form>

                <p className="mt-7 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-teal-400 font-bold hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
