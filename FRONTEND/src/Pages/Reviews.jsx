import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquareQuote } from 'lucide-react';

const Reviews = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/feedback?limit=30`);
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
        <div className="min-h-screen pb-20 text-slate-800">

            <div className="pt-8 pb-12 text-center max-w-3xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-slate-900">
                    Wall of <span className="gradient-text">Love</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
                    Real stories and feedback from mothers, doctors, and ASHA workers across India using MaaCare.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : feedbacks.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500 border border-sky-200">
                        <MessageSquareQuote className="w-16 h-16 mx-auto mb-4 text-sky-400 opacity-60" />
                        <p className="text-lg font-medium">No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {feedbacks.map((item) => (
                            <div key={item._id} className="tilt-card glass-card p-6 break-inside-avoid shadow-md border border-sky-200 bg-white/90 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.user?.profileImage?.url || `https://ui-avatars.com/api/?name=${item.user?.name || 'A'}&background=0284c7&color=fff`}
                                                alt="avatar"
                                                className="w-10 h-10 rounded-full border border-sky-200 shadow-xs"
                                            />
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight">{item.user?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-sky-600 font-semibold">{item.user?.role || 'User'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 bg-sky-50 rounded-full text-sky-800 border border-sky-200 font-medium">
                                            {item.feedbackType}
                                        </span>
                                    </div>

                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>

                                    <p className="text-slate-700 italic mb-4 text-sm leading-relaxed">"{item.comment}"</p>

                                    <div className="text-xs text-slate-400 text-right font-medium">
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
