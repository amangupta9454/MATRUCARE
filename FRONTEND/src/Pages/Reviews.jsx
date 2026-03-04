import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquareQuote } from 'lucide-react';
import Navbar from '../Components/Navbar';

const Reviews = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback?limit=30`);
                setFeedbacks(res.data.feedbacks);
            } catch (error) {
                console.error("Error fetching feedback", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <div className="pt-32 pb-16 text-center max-w-3xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    Wall of <span className="gradient-text">Love</span>
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Real stories and feedback from mothers, doctors, and ASHA workers across India using MaaCare.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : feedbacks.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-400">
                        <MessageSquareQuote className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {feedbacks.map((item) => (
                            <div key={item._id} className="glass-card p-6 break-inside-avoid shadow-lg relative overflow-hidden group">
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-indigo-500/0 group-hover:from-teal-500/5 group-hover:to-indigo-500/5 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.user?.profileImage?.url || `https://ui-avatars.com/api/?name=${item.user?.name || 'A'}&background=14b8a6&color=fff`}
                                                alt="avatar"
                                                className="w-10 h-10 rounded-full border border-white/10"
                                            />
                                            <div>
                                                <p className="font-bold text-white leading-tight">{item.user?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-teal-400">{item.user?.role || 'User'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-400 border border-white/10">
                                            {item.feedbackType}
                                        </span>
                                    </div>

                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                                        ))}
                                    </div>

                                    <p className="text-gray-300 italic mb-4">"{item.comment}"</p>

                                    <div className="text-xs text-gray-500 text-right">
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
