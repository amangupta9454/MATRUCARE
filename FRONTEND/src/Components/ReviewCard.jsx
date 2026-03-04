import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ReviewCard — displays one review entry.
 * Props: review (populated patient.name + profileImage), index
 */
const ReviewCard = ({ review, index = 0 }) => {
    const { patient, rating, reviewText, createdAt } = review;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 p-4 glass-card border border-white/5"
        >
            <img
                src={patient?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${patient?.name}`}
                alt={patient?.name}
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white text-sm">{patient?.name || 'Anonymous'}</p>
                    <span className="text-xs text-gray-600 shrink-0">
                        {new Date(createdAt).toLocaleDateString('en-IN')}
                    </span>
                </div>
                {/* Star display */}
                <div className="flex gap-0.5 mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={13}
                            className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                    ))}
                </div>
                {reviewText && (
                    <p className="text-sm text-gray-400 leading-relaxed">{reviewText}</p>
                )}
            </div>
        </motion.div>
    );
};

export default ReviewCard;
