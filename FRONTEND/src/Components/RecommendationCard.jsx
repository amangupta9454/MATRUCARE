import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Building2, BriefcaseMedical, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BADGE_STYLE = {
    'Top Rated Doctor': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    'Highly Recommended': 'bg-green-500/20  border-green-500/30  text-green-400',
    'Expert Specialist': 'bg-blue-500/20   border-blue-500/30   text-blue-400',
};

/**
 * RecommendationCard — doctor card with reputation badge and rating.
 * Props: doctor (scored + populated), onBook (fn), index
 */
const RecommendationCard = ({ doctor: d, onBook, index = 0 }) => {
    const navigate = useNavigate();
    const badge = d.badge;
    const avatarSrc = d.user?.profileImage?.url || d.imageUrl?.url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${d.user?.name}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="glass-card p-5 hover:border-teal-500/20 transition-all border border-white/10"
        >
            <div className="flex gap-4 items-start">
                <img src={avatarSrc} alt={d.user?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2">
                        <h3 className="font-extrabold text-white">Dr. {d.user?.name}</h3>
                        {badge && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${BADGE_STYLE[badge] || ''}`}>
                                <Award size={10} /> {badge}
                            </span>
                        )}
                        {d.gender && d.gender !== 'Other' && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <User size={10} /> {d.gender}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                        {d.specialistType && (
                            <span className="flex items-center gap-1">
                                <BriefcaseMedical size={11} />{d.specialistType}
                            </span>
                        )}
                        {d.currentOrganization && (
                            <span className="flex items-center gap-1">
                                <Building2 size={11} />{d.currentOrganization}
                            </span>
                        )}
                        {d.experienceYears > 0 && (
                            <span className="flex items-center gap-1">
                                <Calendar size={11} />{d.experienceYears} yrs exp.
                            </span>
                        )}
                    </div>

                    {/* Rating row */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12}
                                    className={s <= Math.round(d.avgRating || 0)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-700'} />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-yellow-400">{d.avgRating?.toFixed(1) || '—'}</span>
                        <span className="text-xs text-gray-600">({d.reviewCount || 0} reviews)</span>
                        {d.score > 0 && (
                            <span className="text-xs text-teal-500 ml-auto">Score: {d.score}</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => navigate(`/doctors/${d._id}/reviews`)}
                            className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all">
                            Reviews
                        </button>
                        {onBook && (
                            <button onClick={() => onBook(d)}
                                className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-lg font-bold transition-all">
                                Book Appointment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RecommendationCard;
