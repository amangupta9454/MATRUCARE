import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Baby, CalendarDays, ShieldCheck, AlertTriangle, ShieldAlert, Syringe } from 'lucide-react';

const riskTheme = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: ShieldCheck },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle },
    High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: ShieldAlert },
};

const FamilyAccessCard = ({ profile, ancVisits = [], appointments = [] }) => {
    if (!profile) return (
        <div className="glass-card p-8 text-center">
            <Baby className="mx-auto h-12 w-12 text-pink-500/40 mb-3" />
            <p className="text-white font-bold mb-1">No Pregnancy Profile Yet</p>
            <p className="text-sm text-gray-500">The pregnancy profile has not been created yet. Ask your family member to set it up.</p>
        </div>
    );

    const week = profile.pregnancyWeek;
    const progress = Math.round((week / 40) * 100);
    const theme = riskTheme[profile.riskLevel] || riskTheme.Low;
    const RiskIcon = theme.icon;
    const nextAnc = ancVisits.find(v => !v.completed);
    const upcomingApt = appointments.filter(a => a.status === 'Approved' || a.status === 'Pending')[0];
    const edd = profile.expectedDeliveryDate ? new Date(profile.expectedDeliveryDate) : null;
    const daysToEDD = edd ? Math.max(0, Math.ceil((edd - new Date()) / (1000 * 60 * 60 * 24))) : null;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-pink-500/20 border border-pink-500/30 p-2.5 rounded-xl"><Baby size={20} className="text-pink-400" /></div>
                    <div>
                        <h3 className="font-extrabold text-white">Pregnancy Overview</h3>
                        <p className="text-xs text-gray-500">Family member view — read only</p>
                    </div>
                </div>

                {/* Week progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-white">Week {week} of 40</span>
                        <span className="text-gray-500">{progress}% complete</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
                            className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-400" />
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-xl font-extrabold text-white">{daysToEDD ?? '—'}</p>
                        <p className="text-xs text-gray-500">Days to delivery</p>
                    </div>
                    <div className={`${theme.bg} ${theme.border} border rounded-xl p-3 text-center`}>
                        <div className="flex items-center justify-center gap-1 mb-1"><RiskIcon size={14} className={theme.color} /></div>
                        <p className={`text-base font-extrabold ${theme.color}`}>{profile.riskLevel}</p>
                        <p className="text-xs text-gray-500">Risk Level</p>
                    </div>
                </div>
            </div>

            {/* ANC & Vaccine status */}
            <div className="glass-card p-5">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Syringe size={15} className="text-purple-400" /> ANC & Vaccine Status</h4>
                <div className="flex gap-3">
                    <div className="flex-1 text-center bg-white/5 rounded-xl p-3">
                        <p className="text-xl font-extrabold text-white">{ancVisits.filter(v => v.completed).length}/{ancVisits.length}</p>
                        <p className="text-xs text-gray-500">ANC visits done</p>
                    </div>
                    {nextAnc && (
                        <div className="flex-1 text-center bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                            <p className="text-xl font-extrabold text-blue-400">W{nextAnc.visitWeek}</p>
                            <p className="text-xs text-gray-500">Next ANC visit</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming appointment */}
            {upcomingApt && (
                <div className="glass-card p-5">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2"><CalendarDays size={15} className="text-teal-400" /> Upcoming Appointment</h4>
                    <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4">
                        <p className="font-bold text-white">{new Date(upcomingApt.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        <p className="text-sm text-gray-400 mt-1">at {upcomingApt.time} · {upcomingApt.mode || 'In-Person'}</p>
                        <span className="inline-block mt-2 text-xs font-bold bg-teal-500/20 border border-teal-500/30 text-teal-400 px-2.5 py-1 rounded-full">{upcomingApt.status}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default FamilyAccessCard;
