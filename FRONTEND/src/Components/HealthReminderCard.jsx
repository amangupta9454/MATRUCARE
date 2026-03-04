import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, Calendar, Clock, Pill, Syringe } from 'lucide-react';

const icons = {
    'Medicine': Pill,
    'Doctor Visit': Calendar,
    'Vaccination': Syringe,
    'default': BellRing
};

const HealthReminderCard = ({ reminder, index = 0 }) => {
    const Icon = icons[reminder.type] || icons['default'];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all group"
        >
            <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                <Icon size={18} />
            </div>
            <div className="flex-1">
                <h4 className="text-white font-bold text-sm">{reminder.type}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{reminder.message}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-mono text-teal-300 flex items-center gap-1.5">
                        <Clock size={12} /> {reminder.time}
                    </span>
                    <button className="text-xs text-gray-500 hover:text-white transition-colors">
                        Acknowledge
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default HealthReminderCard;
