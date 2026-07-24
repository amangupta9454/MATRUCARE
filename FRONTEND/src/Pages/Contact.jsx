import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, CheckCircle2, PhoneCall, Building2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = import.meta.env.VITE_GETFORM_ENDPOINT;

            if (!endpoint) {
                throw new Error("Contact form endpoint is not configured.");
            }

            await axios.post(endpoint, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 text-slate-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl glass-card-elevated p-8 md:p-12 border border-sky-200"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-sky-100 p-4 rounded-2xl border border-sky-200 text-sky-600 shadow-xs">
                        <Mail className="w-10 h-10" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
                    Get in Touch with <span className="gradient-text">Hospital Support</span>
                </h2>
                <p className="text-center text-slate-500 mb-8 text-sm">
                    Have a query, emergency escalation, or hospital partnership inquiry? Reach out to our team.
                </p>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                        <h3 className="text-xl font-extrabold text-emerald-900">Message Sent!</h3>
                        <p className="text-emerald-700 text-sm">
                            Thank you for reaching out. Our clinical support team will respond shortly.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm shadow-md transition-colors"
                        >
                            Send Another Message
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="dark-input"
                                    placeholder="Sarah Jenkins"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="dark-input"
                                    placeholder="sarah@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="dark-input"
                                placeholder="How can we assist your care journey?"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Message</label>
                            <textarea
                                name="message"
                                required
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className="dark-input resize-none"
                                placeholder="Write your message or detailed inquiry here..."
                            ></textarea>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Send Message</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Contact;
