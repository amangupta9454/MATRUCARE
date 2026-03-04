import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * DoctorRating — interactive star widget + review form.
 * Props: doctorId, appointments (array of Approved/Completed appointments for this doctor)
 */
const DoctorRating = ({ doctorId, appointments = [], onSubmit }) => {
    const { token } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [selectedApt, setSelectedApt] = useState(appointments[0]?._id || '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        if (!rating) { setError('Please select a star rating'); return; }
        if (!selectedApt) { setError('Please select an appointment'); return; }
        setSaving(true); setError(''); setSuccess('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
                doctorId,
                appointmentId: selectedApt,
                rating,
                reviewText,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Review submitted! Thank you for your feedback.');
            setRating(0); setReviewText('');
            onSubmit?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting review');
        } finally { setSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border border-yellow-500/20">
            <h3 className="font-extrabold text-white mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" /> Rate This Doctor
            </h3>

            {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 size={14} />{success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {appointments.length > 1 && (
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Appointment</label>
                        <select value={selectedApt} onChange={e => setSelectedApt(e.target.value)} className="dark-input text-sm">
                            {appointments.map(a => (
                                <option key={a._id} value={a._id}>
                                    #{a.appointmentId} — {new Date(a.date).toLocaleDateString('en-IN')}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Star widget */}
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Your Rating *</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <motion.button
                                key={s} type="button"
                                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setHovered(s)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(s)}
                            >
                                <Star size={28}
                                    className={`transition-colors ${s <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                            </motion.button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-sm text-yellow-400 font-bold self-center">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Review (optional)</label>
                    <textarea rows="3" value={reviewText} onChange={e => setReviewText(e.target.value)}
                        placeholder="Share your experience with this doctor..."
                        className="dark-input resize-none text-sm" />
                </div>

                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {saving ? 'Submitting…' : 'Submit Review'}
                </button>
            </form>
        </motion.div>
    );
};

export default DoctorRating;
