import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, MapPin, Building, BedDouble, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalCard = ({ hospital, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card border border-white/10 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-teal-500/30 transition-all cursor-pointer"
            onClick={() => navigate(`/hospital/${hospital._id}`)}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />

            <div className="flex gap-4 items-start relative z-10">
                <img
                    src={hospital.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${hospital.hospitalName}`}
                    alt={hospital.hospitalName}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-lg"
                />
                <div className="flex-1">
                    <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-teal-400 transition-colors">
                        {hospital.hospitalName}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                        <MapPin size={14} className="text-teal-500" /> {hospital.address}, {hospital.city}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <Phone size={14} className="text-blue-500" /> {hospital.phone}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                {hospital.specialties?.slice(0, 3).map((spec, i) => (
                    <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-teal-300">
                        {spec}
                    </span>
                ))}
                {hospital.specialties?.length > 3 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        +{hospital.specialties.length - 3} more
                    </span>
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-300">
                    <BedDouble size={16} /> {hospital.numberOfBeds} Beds
                </span>
                <button
                    className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
                >
                    View Details
                </button>
            </div>
        </motion.div>
    );
};

export default HospitalCard;
