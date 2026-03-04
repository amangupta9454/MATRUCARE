import React from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpecialistConsultationCard = ({ _id, title, doctors, scheduledTime, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card border border-white/10 p-5 rounded-2xl relative overflow-hidden hover:border-indigo-500/30 transition-all group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />

            <h4 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                <Users size={18} className="text-indigo-400" /> {title}
            </h4>

            <p className="text-sm text-gray-400 mb-4 inline-flex items-center gap-1.5 relative z-10">
                <Calendar size={14} className="text-gray-500" /> {new Date(scheduledTime).toLocaleString()}
            </p>

            <div className="flex -space-x-2 overflow-hidden mb-4 relative z-10">
                {doctors?.map((doctor, i) => (
                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-900 border border-white/20" src={doctor.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`} alt={doctor.name} title={doctor.name} />
                ))}
            </div>

            <button
                onClick={() => navigate(`/teleconsult/room/${_id}`)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all relative z-10"
            >
                <Video size={16} /> Join Multi-Specialist Room
            </button>
        </motion.div>
    );
};

export default SpecialistConsultationCard;
