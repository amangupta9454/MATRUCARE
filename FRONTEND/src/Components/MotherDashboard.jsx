import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, PlusCircle, X, Hash, RefreshCw, AlertCircle, HeartPulse, Hospital, Baby, FileText, Video, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import SubmitFeedback from './SubmitFeedback';
import DietPlanner from './DietPlanner';

const statusConfig = {
    Pending: { color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
    Approved: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
    Rejected: { color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
    Cancelled: { color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
    Completed: { color: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
    Rescheduled: { color: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
};

const MotherDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [motherSchedule, setMotherSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState('');

    const [assignableAshas, setAssignableAshas] = useState([]);
    const [rebookTarget, setRebookTarget] = useState(null);
    const [rebookAshaId, setRebookAshaId] = useState('');
    const [rebookLoading, setRebookLoading] = useState(false);

    const fetchAppointments = async () => {
        try {
            const [aptRes, scheduleRes, assignableRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL}/asha/mother-schedule`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                axios.get(`${import.meta.env.VITE_API_URL}/asha/assignable-users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { ashaWorkers: [] } }))
            ]);
            setAppointments(aptRes.data);
            setMotherSchedule(scheduleRes.data || []);
            setAssignableAshas(assignableRes.data?.ashaWorkers || []);
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

    const handleScheduleAsha = async (e) => {
        e.preventDefault();
        if (!scheduleDate || !scheduleTime) return;
        setScheduleLoading(true); setScheduleError('');
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/asha/schedule-visit`,
                { date: scheduleDate, time: scheduleTime },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setScheduleDate(''); setScheduleTime('');
            fetchAppointments();
            alert('ASHA visit scheduled successfully!');
        } catch (err) {
            setScheduleError(err.response?.data?.message || 'Failed to schedule visit.');
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleRebookAsha = async (e) => {
        e.preventDefault();
        setRebookLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/asha/schedule-visit`,
                { date: rebookTarget.date.split('T')[0], time: rebookTarget.time, alternateAshaId: rebookAshaId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRebookTarget(null);
            setRebookAshaId('');
            fetchAppointments();
            alert('Alternative ASHA visit scheduled successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to schedule alternative visit.');
        } finally {
            setRebookLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-sky-200 bg-white text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-500 shadow-xs";

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 text-slate-800">
            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-elevated p-8 w-full max-w-md border border-sky-200">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Cancel Appointment</h3>
                            <p className="text-sm text-slate-600 mb-4">ID: <span className="font-mono font-bold text-sky-700">{cancelTarget.appointmentId}</span></p>
                            {cancelError && <p className="text-sm text-rose-600 mb-4 flex items-center gap-1"><AlertCircle size={16} /> {cancelError}</p>}
                            <textarea rows="3" value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation (optional)" className={`${inputCls} resize-none mb-5`} />
                            <div className="flex gap-3">
                                <button onClick={() => { setCancelTarget(null); setCancelError(''); }} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Keep Appointment</button>
                                <button onClick={handleCancel} disabled={cancelLoading} className="flex-1 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-70 transition-colors shadow-sm">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-elevated p-8 w-full max-w-md border border-sky-200">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Reschedule Appointment</h3>
                            <p className="text-sm text-slate-600 mb-5">ID: <span className="font-mono font-bold text-sky-700">{rescheduleTarget.appointmentId}</span></p>
                            <div className="space-y-4 mb-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">New Date</label>
                                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">New Time Slot</label>
                                    <select value={newTime} onChange={e => setNewTime(e.target.value)} className={inputCls}>
                                        <option value="">-- Select --</option>
                                        {(rescheduleTarget.doctor?.availableSlots?.length > 0 ? rescheduleTarget.doctor.availableSlots : ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setRescheduleTarget(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Go Back</button>
                                <button onClick={handleReschedule} disabled={rescheduleLoading || !newDate || !newTime} className="flex-1 py-3 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-70 transition-colors shadow-sm">
                                    {rescheduleLoading ? 'Rescheduling...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rebook Modal */}
            <AnimatePresence>
                {rebookTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-elevated p-8 w-full max-w-md border border-amber-200">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Rebook ASHA Worker</h3>
                            <p className="text-sm text-slate-600 mb-5">Original Date: <strong className="text-slate-800">{new Date(rebookTarget.date).toLocaleDateString('en-IN')}</strong> at {rebookTarget.time}</p>
                            <form onSubmit={handleRebookAsha}>
                                <div className="mb-5">
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Select Available ASHA</label>
                                    <select value={rebookAshaId} onChange={e => setRebookAshaId(e.target.value)} required className={inputCls}>
                                        <option value="">-- Choose ASHA Worker --</option>
                                        {assignableAshas.map(a => (
                                            <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setRebookTarget(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" disabled={rebookLoading || !rebookAshaId} className="flex-1 py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-70 transition-colors shadow-sm">
                                        {rebookLoading ? 'Booking...' : 'Confirm Rebook'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mother Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome, <span className="font-bold text-sky-800">{user?.name}</span>. Manage your care & health today.</p>
                </div>
                <Link to="/doctors" className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-full font-bold shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5">
                    <PlusCircle size={20} /> Book Appointment
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left side UI - Dash links & Diet */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/health-dashboard" className="tilt-card glass-card p-5 flex flex-col justify-between hover:border-pink-300 transition-all group border border-sky-200 bg-white/90 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-pink-100 border border-pink-200 p-3 rounded-xl text-pink-600"><HeartPulse size={22} /></div>
                                <div>
                                    <p className="font-bold text-slate-900">Health Data</p>
                                    <p className="text-xs text-slate-500">Track vitals</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 font-medium flex justify-between items-center w-full">View Dashboard <span className="group-hover:text-sky-600 transition-colors">→</span></div>
                        </Link>
                        <Link to="/baby-dashboard" className="tilt-card glass-card p-5 flex flex-col justify-between hover:border-rose-300 transition-all group border border-sky-200 bg-white/90 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-rose-100 border border-rose-200 p-3 rounded-xl text-rose-600"><Baby size={22} /></div>
                                <div>
                                    <p className="font-bold text-slate-900">Baby Dashboard</p>
                                    <p className="text-xs text-slate-500">Vaccines & Growth</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 font-medium flex justify-between items-center w-full">Track Child <span className="group-hover:text-sky-600 transition-colors">→</span></div>
                        </Link>
                        <Link to="/teleconsult" className="tilt-card glass-card p-5 flex flex-col justify-between hover:border-indigo-300 transition-all group border border-sky-200 bg-white/90 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-100 border border-indigo-200 p-3 rounded-xl text-indigo-600"><Video size={22} /></div>
                                <div>
                                    <p className="font-bold text-slate-900">Tele-Consult</p>
                                    <p className="text-xs text-slate-500">Remote check-ups</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 font-medium flex justify-between items-center w-full">Book Call <span className="group-hover:text-sky-600 transition-colors">→</span></div>
                        </Link>
                        <Link to="/health-records" className="tilt-card glass-card p-5 flex flex-col justify-between hover:border-sky-300 transition-all group border border-sky-200 bg-white/90 h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-sky-100 border border-sky-200 p-3 rounded-xl text-sky-600"><FileText size={22} /></div>
                                <div>
                                    <p className="font-bold text-slate-900">My Records</p>
                                    <p className="text-xs text-slate-500">Health Timeline</p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-600 font-medium flex justify-between items-center w-full">View History <span className="group-hover:text-sky-600 transition-colors">→</span></div>
                        </Link>
                    </div>

                    {/* ASHA Worker Schedule & Request Form */}
                    <div className="glass-card p-6 border border-emerald-200 bg-emerald-50/50 mb-8">
                        <h3 className="font-extrabold text-emerald-900 text-lg mb-4 flex items-center gap-2">
                            <User size={20} className="text-emerald-600" /> ASHA Worker Home Visits
                        </h3>
                        
                        {/* The Request Form */}
                        <div className="bg-white/80 p-5 rounded-xl border border-emerald-100 mb-6">
                            <h4 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                                <PlusCircle size={16} /> Request New Visit
                            </h4>
                            <form onSubmit={handleScheduleAsha} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                                    <input type="time" required value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className={inputCls} />
                                </div>
                                <div className="sm:col-span-2 md:col-span-1">
                                    <button type="submit" disabled={scheduleLoading || !scheduleDate || !scheduleTime} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50">
                                        {scheduleLoading ? 'Scheduling...' : 'Schedule Visit'}
                                    </button>
                                </div>
                            </form>
                            {scheduleError && (
                                <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                                    <AlertCircle size={16} /> {scheduleError}
                                </div>
                            )}
                        </div>

                        {/* The Upcoming Visits */}
                        <h4 className="text-sm font-bold text-emerald-800 mb-3">Upcoming Visits</h4>
                        {motherSchedule.length > 0 ? (
                            <div className="space-y-3">
                                {motherSchedule.map((s) => {
                                    const isCancelled = s.status === 'Cancelled';
                                    return (
                                        <div key={s._id} className={`bg-white/80 p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-3 ${isCancelled ? 'border-rose-200 bg-rose-50/30' : 'border-emerald-100'}`}>
                                            <div className="flex gap-4 items-center">
                                                <img src={s.ashaWorker?.profileImage?.url || 'https://i.pravatar.cc/60?img=5'} alt="ASHA" className={`w-12 h-12 rounded-full border object-cover ${isCancelled ? 'border-rose-200 grayscale' : 'border-emerald-200'}`} />
                                                <div>
                                                    <p className={`font-bold ${isCancelled ? 'text-rose-800 line-through decoration-rose-300' : 'text-slate-800'}`}>{s.ashaWorker?.name}</p>
                                                    {s.doctor ? (
                                                        <p className="text-sm text-slate-600 flex items-center gap-1"><Hospital size={14} /> Scheduled by Dr. {s.doctor?.name || 'Hospital'}</p>
                                                    ) : (
                                                        <p className="text-sm text-slate-600 flex items-center gap-1"><User size={14} /> Scheduled by You</p>
                                                    )}
                                                    {s.location && (
                                                        <p className="text-xs text-slate-500 mt-1">Location: {s.location}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className={`text-sm font-bold bg-white/50 border px-3 py-1.5 rounded-lg inline-block ${isCancelled ? 'text-rose-700 border-rose-200' : 'text-emerald-700 border-emerald-200'}`}>
                                                    {new Date(s.date).toLocaleDateString('en-IN')} at {s.time}
                                                </p>
                                                <p className={`text-xs mt-1.5 font-medium flex items-center md:justify-end gap-1 ${isCancelled ? 'text-rose-600' : 'text-slate-500'}`}>
                                                    <Clock size={12} /> Status: {s.status}
                                                </p>
                                                {isCancelled && (
                                                    <button 
                                                        onClick={() => setRebookTarget(s)}
                                                        className="mt-3 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                                    >
                                                        Rebook Alternative ASHA
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-white/50 rounded-xl border border-emerald-100 border-dashed">
                                <HeartPulse className="mx-auto h-8 w-8 text-emerald-300 mb-2" />
                                <p className="text-emerald-900 font-bold mb-1">No upcoming ASHA visits</p>
                                <p className="text-xs text-emerald-700">Schedule one using the form above.</p>
                            </div>
                        )}
                    </div>

                    {/* The Diet Planner */}
                    <DietPlanner />
                </div>

                {/* Right side - Feedback widget */}
                <div className="space-y-8">
                    <SubmitFeedback />

                    <div className="glass-card p-6 border border-sky-200 bg-sky-50/80">
                        <h3 className="font-extrabold text-sky-900 text-lg mb-2">Did You Know?</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            MaaCare supports <span className="text-sky-900 font-bold">Live Text Translation</span> in English, Hindi, and Marathi! Open a chat with your doctor and type naturally in your preferred language.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden border border-sky-200 bg-white/90">
                <div className="px-6 py-5 border-b border-sky-100 flex justify-between items-center">
                    <h2 className="text-lg font-extrabold text-slate-900">Your Appointments</h2>
                    <span className="bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold px-3 py-1 rounded-full">{appointments.length} Total</span>
                </div>

                {/* Doctor Appointments List */}

                {appointments.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-lg text-slate-600">No doctor appointments yet.</p>
                        <Link to="/doctors" className="text-sky-700 font-bold mt-2 inline-block hover:underline">Browse Doctors →</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-sky-100">
                        {appointments.map(apt => {
                            const cfg = statusConfig[apt.status] || statusConfig.Pending;
                            const modifiable = canModify(apt);
                            return (
                                <motion.div key={apt._id} layout className="p-6 hover:bg-sky-50/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex gap-4 items-start">
                                            <img src={apt.doctor?.user?.profileImage?.url || 'https://i.pravatar.cc/60'} alt="Doctor"
                                                className="w-14 h-14 rounded-2xl object-cover border border-sky-200 shrink-0 shadow-xs" />
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">Dr. {apt.doctor?.user?.name || 'Unknown'}</h3>
                                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600">
                                                    <span className="flex items-center gap-1"><CalendarIcon size={13} /> {new Date(apt.date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={13} /> {apt.time}</span>
                                                    <span className="flex items-center gap-1 font-mono font-semibold text-sky-700"><Hash size={13} />{apt.appointmentId}</span>
                                                </div>
                                                {apt.mode && <p className="text-xs mt-1 text-slate-500">Mode: <span className="text-slate-800 font-medium">{apt.mode}</span></p>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                {apt.status}
                                            </span>
                                            {modifiable && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setRescheduleTarget(apt)} className="text-xs flex items-center gap-1 text-sky-700 border border-sky-300 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                        <RefreshCw size={12} /> Reschedule
                                                    </button>
                                                    <button onClick={() => { setCancelTarget(apt); setCancelError(''); }} className="text-xs flex items-center gap-1 text-rose-600 border border-rose-300 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                        <X size={12} /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prescription banner */}
                                    {apt.prescription?.url && (
                                        <div className="mt-4 pt-4 border-t border-emerald-200 flex items-center justify-between gap-3 bg-emerald-50/80 -mx-6 px-6 py-3 rounded-b-2xl">
                                            <div>
                                                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><FileText size={13} /> Prescription Available</p>
                                                {apt.prescription.notes && <p className="text-xs text-slate-600 mt-0.5">Note: {apt.prescription.notes}</p>}
                                                <p className="text-xs text-slate-500 mt-0.5">{apt.prescription.uploadedAt ? new Date(apt.prescription.uploadedAt).toLocaleDateString('en-IN') : ''}</p>
                                            </div>
                                            <a href={apt.prescription.url} target="_blank" rel="noreferrer"
                                                className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs">
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
