import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar as CalendarIcon, User, Mail, Phone, Shield } from 'lucide-react';
import axios from 'axios';

const HospitalBookingForm = ({ hospitalId, service, onClose }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        patientEmail: '',
        mobileNumber: '',
        preferredDate: '',
        notes: '',
        insurancePolicyId: ''
    });
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);

    // Example: Estimate a generic cost range if price not available 
    const baseCost = service?.price || Math.floor(Math.random() * 5000) + 1000;

    // Calculates cost dynamically if insurance is selected - simulate a 80% discount
    const estimatedCost = formData.insurancePolicyId ? Math.floor(baseCost * 0.2) : baseCost;

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/insurance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPolicies(res.data.policies);
            } catch (err) {
                console.error('Failed to load insurance policies', err);
            }
        };
        fetchPolicies();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/hospital-bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                    hospitalId,
                    serviceId: service?._id,
                    serviceSelected: service?.serviceName || 'General Consultation',
                    estimatedCost,
                    ...formData
                })
            });

            const data = await res.json();
            if (data.success) {
                alert('Booking requested successfully!');
                onClose();
            } else {
                alert(data.message || 'Failed to request booking');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative my-8"
            >
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full p-2">
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Book Service</h2>
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        Booking: <span className="text-teal-400 font-semibold">{service?.serviceName}</span>
                    </p>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Estimated Cost</p>
                        <p className="text-lg font-bold text-white">₹{estimatedCost.toLocaleString()}</p>
                        {formData.insurancePolicyId && <p className="text-xs text-emerald-400 mt-1">Covered Rate Applied</p>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Patient Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="John Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input required type="email" name="patientEmail" value={formData.patientEmail} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="john@example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="+91 9876543210" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Preferred Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input required type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-teal-500 [color-scheme:dark]" />
                        </div>
                    </div>

                    {/* Insurance Selection */}
                    {policies.length > 0 && (
                        <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl space-y-2">
                            <label className="text-xs text-sky-400 uppercase font-semibold block mb-1 flex items-center gap-2">
                                <Shield size={14} /> Apply Health Insurance
                            </label>
                            <select
                                name="insurancePolicyId"
                                value={formData.insurancePolicyId}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                            >
                                <option value="">Continue without insurance</option>
                                {policies.map(p => (
                                    <option key={p._id} value={p._id}>{p.providerName} (...{p.policyNumber.slice(-4)})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Additional Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="Any specific requirements..."></textarea>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 mt-4 disabled:opacity-50">
                        {loading ? 'Submitting...' : `Confirm Request • ₹${estimatedCost.toLocaleString()}`}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default HospitalBookingForm;
