import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorMotherCard = ({ mentor, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl -mr-5 -mt-5 rounded-full" />

            <div className="flex gap-4 items-start relative z-10">
                <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}&backgroundColor=ec4899`}
                    alt={mentor.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-pink-500/50 shadow-lg"
                />
                <div>
                    <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                        {mentor.name} <Award size={16} className="text-pink-400" />
                    </h3>
                    <p className="text-sm text-pink-300 mt-0.5">{mentor.experienceYears} Years Experience</p>
                </div>
            </div>

            <p className="text-sm text-gray-400 mt-4 line-clamp-2 relative z-10 min-h-[40px]">
                "{mentor.bio || 'Happy to guide new mothers through their beautiful journey.'}"
            </p>

            <div className="flex flex-wrap gap-2 mt-4 relative z-10 h-[50px]">
                {mentor.expertiseTopics?.slice(0, 3).map((topic, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                        {topic}
                    </span>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex gap-2 relative z-10">
                <button
                    className="flex-[0.3] bg-white/5 hover:bg-white/10 text-white font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                >
                    <Heart size={16} className="text-pink-500" />
                </button>
                <button
                    onClick={() => navigate(`/chat`)}
                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20"
                >
                    <MessageCircle size={16} /> Connect & Chat
                </button>
            </div>
        </motion.div>
    );
};

export default MentorMotherCard;
