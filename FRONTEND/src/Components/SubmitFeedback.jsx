import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const SubmitFeedback = () => {
    const [feedbackType, setFeedbackType] = useState('Project'); // Project, Doctor, Facility
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating");
        if (!comment.trim()) return alert("Please write a comment");

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Mock targetId for Doctor/Facility if needed, but for now just submit Project
            await axios.post(`${import.meta.env.VITE_API_URL}/feedback`, {
                feedbackType,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Thank you for helping MaaCare improve!');
            setRating(0);
            setComment('');
        } catch (error) {
            console.error(error);
            alert("Error submitting feedback. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-card p-6 text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-teal-400" fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold mb-2">Feedback Received</h3>
                <p className="text-gray-300 mb-4">{success}</p>
                <button onClick={() => setSuccess('')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Star className="w-5 h-5 text-teal-400" /> Share Your Experience
            </h3>
            <p className="text-gray-400 text-sm mb-6">Help us build the best maternal care platform in India.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Feedback Regarding</label>
                    <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="dark-input"
                    >
                        <option value="Project">MaaCare Platform</option>
                        <option value="Doctor">Doctors / Staff</option>
                        <option value="Facility">Hospital Facility</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                                className={`transition-colors ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                                <Star className="w-8 h-8" fill={(hover || rating) >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Your Thoughts</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="dark-input h-24 resize-none"
                        placeholder="What did you love? What can we improve?"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default SubmitFeedback;
