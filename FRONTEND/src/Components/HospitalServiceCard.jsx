import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, CalendarPlus, Activity } from 'lucide-react';

const HospitalServiceCard = ({ service, onBook, index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card border border-white/10 p-5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={48} className="text-blue-400" />
            </div>

            <h4 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                <Stethoscope size={18} className="text-blue-400" /> {service.serviceName}
            </h4>

            <p className="text-sm text-gray-400 mb-4 flex-1 relative z-10 line-clamp-3">
                {service.description || 'No detailed description provided.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                <div>
                    <span className="text-xs text-gray-500 block mb-0.5">Price / Fee</span>
                    <span className="text-white font-bold text-lg">₹{service.price}</span>
                </div>
                <button
                    onClick={() => onBook(service)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                    <CalendarPlus size={16} /> Book Now
                </button>
            </div>
        </motion.div>
    );
};

export default HospitalServiceCard;
