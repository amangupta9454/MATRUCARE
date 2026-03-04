import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, PlusCircle, X, Hash, RefreshCw, AlertCircle, HeartPulse, Hospital, Baby, FileText, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import SubmitFeedback from './SubmitFeedback';
import DietPlanner from './DietPlanner';

const statusConfig = {
    // ... existing status config ...
    Pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
    Approved: { color: 'bg-green-500/20 text-green-300 border-green-500/30', dot: 'bg-green-400' },
    Rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', dot: 'bg-red-400' },
    Cancelled: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', dot: 'bg-gray-400' },
    Completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
    Rescheduled: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
};

const MotherDashboard = () => {
    // ... component state ...
    const { user, token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAppointments(res.data);
            // ... standard methods logic ...
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, [token]);

    const canModify = (apt) => {
        const diff = new Date(apt.date).getTime() - Date.now();
        return diff > 24 * 60 * 60 * 1000 && ['Pending', 'Approved'].includes(apt.status);
    };

    const handleCancel = async () => {
        if (!cancelTarget) return;
        setCancelLoading(true); setCancelError('');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${cancelTarget._id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: cancelReason }
            });
            setCancelTarget(null); setCancelReason('');
            fetchAppointments();
        } catch (err) {
            setCancelError(err.response?.data?.message || 'Cancellation failed.');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleTarget || !newDate || !newTime) return;
        setRescheduleLoading(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/appointments/${rescheduleTarget._id}/reschedule`,
                { newDate, newTime },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRescheduleTarget(null); setNewDate(''); setNewTime('');
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || 'Reschedule failed.');
        } finally {
            setRescheduleLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500";

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
// ... existing modals logic ...
            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-8 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-2">Cancel Appointment</h3>
                            <p className="text-sm text-gray-400 mb-4">ID: <span className="font-mono font-bold text-teal-400">{cancelTarget.appointmentId}</span></p>
                            {cancelError && <p className="text-sm text-red-400 mb-4 flex items-center gap-1"><AlertCircle size={16} /> {cancelError}</p>}
                            <textarea rows="3" value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation (optional)" className={`${inputCls} resize-none mb-5`} />
                            <div className="flex gap-3">
                                <button onClick={() => { setCancelTarget(null); setCancelError(''); }} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Keep Appointment</button>
                                <button onClick={handleCancel} disabled={cancelLoading} className="flex-1 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-70 transition-colors">
                                    {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reschedule Modal */}
            <AnimatePresence>
                {rescheduleTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-8 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-2">Reschedule Appointment</h3>
                            <p className="text-sm text-gray-400 mb-5">ID: <span className="font-mono font-bold text-teal-400">{rescheduleTarget.appointmentId}</span></p>
                            <div className="space-y-4 mb-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">New Date</label>
                                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">New Time Slot</label>
                                    <select value={newTime} onChange={e => setNewTime(e.target.value)} className={inputCls}>
                                        <option value="">-- Select --</option>
                                        {(rescheduleTarget.doctor?.availableSlots?.length > 0 ? rescheduleTarget.doctor.availableSlots : ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setRescheduleTarget(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Go Back</button>
                                <button onClick={handleReschedule} disabled={rescheduleLoading || !newDate || !newTime} className="flex-1 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-70 transition-colors">
                                    {rescheduleLoading ? 'Rescheduling...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Mother Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome, {user?.name}. Manage your care & health today.</p>
                </div>
                <Link to="/doctors" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-teal-500/20 transition-all">
                    <PlusCircle size={20} /> Book Appointment
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left side UI - Dash links & Diet */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/health-dashboard" className="glass-card p-5 flex flex-col justify-between hover:border-pink-500/30 transition-all group border border-white/10 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-pink-500/20 border border-pink-500/30 p-3 rounded-xl"><HeartPulse size={22} className="text-pink-400" /></div>
                                <div>
                                    <p className="font-bold text-white">Health Data</p>
                                    <p className="text-xs text-gray-500">Track vitals</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center w-full">View Dashboard <span className="group-hover:text-white transition-colors">→</span></div>
                        </Link>
                        <Link to="/baby-dashboard" className="glass-card p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all group border border-white/10 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-rose-500/20 border border-rose-500/30 p-3 rounded-xl"><Baby size={22} className="text-rose-400" /></div>
                                <div>
                                    <p className="font-bold text-white">Baby Dashboard</p>
                                    <p className="text-xs text-gray-500">Vaccines & Growth</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center w-full">Track Child <span className="group-hover:text-white transition-colors">→</span></div>
                        </Link>
                        <Link to="/teleconsult" className="glass-card p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all group border border-white/10 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-xl"><Video size={22} className="text-indigo-400" /></div>
                                <div>
                                    <p className="font-bold text-white">Tele-Consult</p>
                                    <p className="text-xs text-gray-500">Remote check-ups</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center w-full">Book Call <span className="group-hover:text-white transition-colors">→</span></div>
                        </Link>
                        <Link to="/health-records" className="glass-card p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all group border border-white/10 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-xl"><FileText size={22} className="text-blue-400" /></div>
                                <div>
                                    <p className="font-bold text-white">My Records</p>
                                    <p className="text-xs text-gray-500">Health Timeline</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex justify-between items-center w-full">View History <span className="group-hover:text-white transition-colors">→</span></div>
                        </Link>
                    </div>

                    {/* The Diet Planner dynamically goes here */}
                    <DietPlanner />
                </div>

                {/* Right side - Feedback widget */}
                <div className="space-y-8">
                    <SubmitFeedback />

                    <div className="glass-card p-6 border border-teal-500/20 bg-teal-500/5">
                        <h3 className="font-bold text-teal-300 text-lg mb-2">Did You Know?</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            MaaCare now supports <span className="text-white font-bold">Live Text Translation</span> in English, Hindi, and Marathi! Open a chat with your doctor and type naturally in your preferred language.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Your Appointments</h2>
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold px-3 py-1 rounded-full">{appointments.length} Total</span>
                </div>

                {appointments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-lg text-gray-400">No appointments yet.</p>
                        <Link to="/doctors" className="text-teal-400 font-bold mt-2 inline-block hover:underline">Browse Doctors →</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {appointments.map(apt => {
                            const cfg = statusConfig[apt.status] || statusConfig.Pending;
                            const modifiable = canModify(apt);
                            return (
                                <motion.div key={apt._id} layout className="p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex gap-4 items-start">
                                            <img src={apt.doctor?.user?.profileImage?.url || 'https://i.pravatar.cc/60'} alt="Doctor"
                                                className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-lg text-white">Dr. {apt.doctor?.user?.name || 'Unknown'}</h3>
                                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1"><CalendarIcon size={13} /> {new Date(apt.date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={13} /> {apt.time}</span>
                                                    <span className="flex items-center gap-1 font-mono font-semibold text-teal-400"><Hash size={13} />{apt.appointmentId}</span>
                                                </div>
                                                {apt.mode && <p className="text-xs mt-1 text-gray-500">Mode: <span className="text-gray-300">{apt.mode}</span></p>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                {apt.status}
                                            </span>
                                            {modifiable && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setRescheduleTarget(apt)} className="text-xs flex items-center gap-1 text-teal-400 border border-teal-500/30 hover:bg-teal-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                        <RefreshCw size={12} /> Reschedule
                                                    </button>
                                                    <button onClick={() => { setCancelTarget(apt); setCancelError(''); }} className="text-xs flex items-center gap-1 text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                        <X size={12} /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prescription banner */}
                                    {apt.prescription?.url && (
                                        <div className="mt-4 pt-4 border-t border-green-500/20 flex items-center justify-between gap-3 bg-green-500/5 -mx-6 px-6 py-3 rounded-b-2xl">
                                            <div>
                                                <p className="text-xs font-bold text-green-400 flex items-center gap-1.5"><FileText size={13} /> Prescription Available</p>
                                                {apt.prescription.notes && <p className="text-xs text-gray-500 mt-0.5">Note: {apt.prescription.notes}</p>}
                                                <p className="text-xs text-gray-600 mt-0.5">{apt.prescription.uploadedAt ? new Date(apt.prescription.uploadedAt).toLocaleDateString('en-IN') : ''}</p>
                                            </div>
                                            <a href={apt.prescription.url} target="_blank" rel="noreferrer"
                                                className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                                <FileText size={12} /> Download
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MotherDashboard;
