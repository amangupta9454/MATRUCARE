import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Star, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewCard from '../Components/ReviewCard';
import DoctorRating from '../Components/DoctorRating';

const RatingBar = ({ star, count, total }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400 shrink-0 w-4">{star}</span>
        <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
        <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-yellow-400 h-full transition-all" style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
        </div>
        <span className="text-gray-600 shrink-0 w-4 text-right">{count}</span>
    </div>
);

const DoctorReviews = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [myApts, setMyApts] = useState([]); // mother's appointments with this doctor

    const fetch = async () => {
        try {
            const [docRes, reviewRes] = await Promise.allSettled([
                axios.get(`${import.meta.env.VITE_API_URL}/doctors/${doctorId}`),
                axios.get(`${import.meta.env.VITE_API_URL}/reviews/${doctorId}`),
            ]);
            if (docRes.status === 'fulfilled') setDoctor(docRes.value.data);
            if (reviewRes.status === 'fulfilled') {
                setReviews(reviewRes.value.data.reviews);
                setAvgRating(reviewRes.value.data.avgRating);
                setReviewCount(reviewRes.value.data.reviewCount);
            }

            if (user?.role === 'Mother' && token) {
                const aptsRes = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`,
                    { headers: { Authorization: `Bearer ${token}` } });
                setMyApts((aptsRes.data || []).filter(a =>
                    a.doctor?._id === doctorId && ['Approved', 'Completed'].includes(a.status)));
            }
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [doctorId]);

    // Rating distribution
    const dist = [5, 4, 3, 2, 1].map(s => ({
        star: s,
        count: reviews.filter(r => r.rating === s).length,
    }));

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold transition-colors">
                <ArrowLeft size={16} /> Back
            </button>

            {/* Doctor identity */}
            {doctor && (
                <div className="glass-card p-6 flex gap-5 items-center border border-white/10">
                    <img
                        src={doctor.user?.profileImage?.url || doctor.imageUrl?.url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.user?.name}`}
                        className="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
                        alt={doctor.user?.name} />
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Dr. {doctor.user?.name}</h1>
                        <p className="text-gray-500 text-sm">{doctor.specialistType || doctor.specialization}</p>
                        {doctor.currentOrganization && (
                            <p className="text-gray-600 text-xs mt-0.5">{doctor.currentOrganization}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Rating summary */}
            <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border border-yellow-500/20">
                {/* Big score */}
                <div className="flex flex-col items-center justify-center">
                    <p className="text-6xl font-extrabold text-yellow-400">
                        {avgRating ? avgRating.toFixed(1) : '—'}
                    </p>
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={20}
                                className={s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{reviewCount} reviews</p>
                </div>
                {/* Distribution bars */}
                <div className="space-y-2 justify-center flex flex-col">
                    {dist.map(d => <RatingBar key={d.star} star={d.star} count={d.count} total={reviewCount} />)}
                </div>
            </div>

            {/* Rate form (Mother with qualifying appointments) */}
            {user?.role === 'Mother' && myApts.length > 0 && (
                <DoctorRating doctorId={doctorId} appointments={myApts} onSubmit={fetch} />
            )}
            {user?.role === 'Mother' && myApts.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-2">
                    You need an Approved or Completed appointment with this doctor to leave a review.
                </p>
            )}

            {/* Reviews list */}
            <div>
                <h2 className="text-lg font-extrabold text-white mb-4">All Reviews</h2>
                {reviews.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <Star className="mx-auto h-10 w-10 text-gray-700 mb-3" />
                        <p className="text-white font-bold">No reviews yet</p>
                        <p className="text-sm text-gray-500 mt-1">Be the first to review this doctor.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorReviews;
