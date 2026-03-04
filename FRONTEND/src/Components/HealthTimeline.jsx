import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Clock, CalendarDays, FileText, Syringe, Pill, UserCheck, Baby, HeartPulse } from 'lucide-react';

const EVENT_TYPES = {
    appointment: { icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Appointment' },
    report: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Lab Report' },
    vaccination: { icon: Syringe, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', label: 'Vaccination' },
    medicine: { icon: Pill, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Medicine' },
    visit: { icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'ASHA Visit' },
    baby: { icon: Baby, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Baby Event' },
    profile: { icon: HeartPulse, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', label: 'Profile' },
};

const HealthTimeline = () => {
    const { token } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeader = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchers = [
            axios.get(`${import.meta.env.VITE_API_URL}/appointments`, { headers: authHeader })
                .then(r => r.data.map(a => ({ type: 'appointment', date: a.date, title: `Appointment with Dr. ${a.doctor?.user?.name || 'Doctor'}`, sub: `${a.time} · ${a.status}`, id: a._id }))),
            axios.get(`${import.meta.env.VITE_API_URL}/reports`, { headers: authHeader })
                .then(r => r.data.map(a => ({ type: 'report', date: a.uploadDate || a.createdAt, title: a.reportName, sub: a.reportType || 'Lab Report', id: a._id }))),
            axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/vaccinations`, { headers: authHeader })
                .then(r => r.data.filter(v => v.completed).map(v => ({ type: 'vaccination', date: v.completedDate, title: `Vaccination: ${v.vaccineName}`, sub: 'Completed', id: v._id }))),
            axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/medicines`, { headers: authHeader })
                .then(r => r.data.map(m => ({ type: 'medicine', date: m.startDate || m.createdAt, title: `Medicine: ${m.medicineName}`, sub: `${m.dosage} · ${m.frequency}`, id: m._id }))),
            axios.get(`${import.meta.env.VITE_API_URL}/asha/my-visits`, { headers: authHeader })
                .then(r => r.data.map(v => ({ type: 'visit', date: v.visitDate, title: `ASHA Home Visit`, sub: v.ashaWorker?.name || 'ASHA Worker', id: v._id }))),
            axios.get(`${import.meta.env.VITE_API_URL}/baby`, { headers: authHeader })
                .then(r => [{ type: 'baby', date: r.data.createdAt, title: `Baby Profile Created — ${r.data.babyName}`, sub: `Born: ${new Date(r.data.birthDate).toLocaleDateString('en-IN')}`, id: r.data._id }]),
            axios.get(`${import.meta.env.VITE_API_URL}/baby-vaccines`, { headers: authHeader })
                .then(r => r.data.filter(v => v.completed).map(v => ({ type: 'baby', date: v.completedDate, title: `Baby Vaccine: ${v.vaccineName}`, sub: 'Completed', id: v._id }))),
        ];

        Promise.allSettled(fetchers).then(results => {
            const all = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value)
                .filter(e => e.date)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setEvents(all);
        }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" /></div>;

    if (!events.length) return (
        <div className="text-center py-12">
            <Clock className="mx-auto h-14 w-14 text-gray-600 mb-4" />
            <p className="text-white font-bold">Your health timeline is empty</p>
            <p className="text-sm text-gray-500 mt-1">Events will appear here as you use MaaCare.</p>
        </div>
    );

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" style={{ marginLeft: '11px' }} />
            <div className="space-y-1 pl-12">
                {events.map((ev, i) => {
                    const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.profile;
                    const Icon = cfg.icon;
                    return (
                        <motion.div key={`${ev.type}-${ev.id}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="relative mb-4">
                            {/* Dot */}
                            <div className={`absolute -left-12 w-6 h-6 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center`}
                                style={{ top: '10px', marginLeft: '-23px' }}>
                                <Icon size={11} className={cfg.color} />
                            </div>

                            <div className={`glass-card p-4 border ${cfg.border}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-white text-sm">{ev.title}</p>
                                        {ev.sub && <p className="text-xs text-gray-500 mt-0.5">{ev.sub}</p>}
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                                        <p className="text-xs text-gray-600 mt-1">{new Date(ev.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default HealthTimeline;
