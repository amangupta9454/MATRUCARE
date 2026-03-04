import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Send, Loader2, AlertCircle, X, CheckCircle2,
    Clock, RefreshCw, Hash, User
} from 'lucide-react';
import TeleConsultCard from '../Components/TeleConsultCard';

const TeleConsult = () => {
    const { user, token } = useContext(AuthContext);
    const isDoctor = user?.role === 'Doctor';
    const isMother = user?.role === 'Mother';

    const [consults, setConsults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]); // mother's appointments for dropdown

    const [form, setForm] = useState({ doctorId: '', description: '', preferredTime: '', appointmentId: '' });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Doctor reject modal state
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectNote, setRejectNote] = useState('');
    const [rejectSaving, setRejectSaving] = useState(false);

    const authHeader = { Authorization: `Bearer ${token}` };

    // ── Fetch data ────────────────────────────────────────────────────────
    const fetchData = async () => {
        try {
            const endpoint = isDoctor ? '/teleconsult/doctor' : '/teleconsult/my';
            const [cRes] = await Promise.allSettled([
                axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, { headers: authHeader }),
            ]);
            if (cRes.status === 'fulfilled') setConsults(cRes.value.data);

            if (isMother) {
                const [docRes, aptRes] = await Promise.allSettled([
                    axios.get(`${import.meta.env.VITE_API_URL}/doctors`, { headers: authHeader }),
                    axios.get(`${import.meta.env.VITE_API_URL}/appointments`, { headers: authHeader }),
                ]);
                if (docRes.status === 'fulfilled') setDoctors(docRes.value.data.filter(d => d.isListed));
                if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data.filter(a => a.status === 'Approved'));
            }
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [token]);

    // ── Mother: submit new request ─────────────────────────────────────────
    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/teleconsult`, form, { headers: authHeader });
            setSuccess('Request sent! The doctor will be notified by email.');
            setForm({ doctorId: '', description: '', preferredTime: '', appointmentId: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Error sending request'); }
        finally { setSaving(false); }
    };

    // ── Doctor: quick accept ───────────────────────────────────────────────
    const handleAccept = async (consultId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${consultId}`, { status: 'Accepted' }, { headers: authHeader });
            fetchData();
        } catch { }
    };

    // ── Doctor: reject with note ───────────────────────────────────────────
    const handleReject = async () => {
        setRejectSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${rejectTarget._id}`,
                { status: 'Rejected', doctorNote: rejectNote }, { headers: authHeader });
            setRejectTarget(null); setRejectNote('');
            fetchData();
        } catch { } finally { setRejectSaving(false); }
    };

    // ── Doctor: mark complete ─────────────────────────────────────────────
    const handleComplete = async (consultId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${consultId}`, { status: 'Completed' }, { headers: authHeader });
            fetchData();
        } catch { }
    };

    // ── Render ────────────────────────────────────────────────────────────
    const lbl = 'text-xs font-bold text-gray-400 uppercase tracking-wider';
    const inp = 'dark-input';

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <div className="bg-indigo-500/20 border border-indigo-500/30 p-2.5 rounded-xl">
                        <Video size={22} className="text-indigo-400" />
                    </div>
                    Tele-Consultation
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    {isDoctor ? 'Manage incoming consultation requests from patients' : 'Request a remote video consultation with your doctor'}
                </p>
            </div>

            {/* ── Mother: request form ── */}
            {isMother && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-indigo-500/20">
                    <h2 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2">
                        <Send size={16} className="text-indigo-400" /> New Request
                    </h2>

                    {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{success}</div>}
                    {error && <div className="mb-4 p-3 bg-red-500/10   border border-red-500/30   rounded-xl text-red-400   text-sm flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={lbl}>Select Doctor *</label>
                                <select required value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className={inp}>
                                    <option value="">Choose a doctor…</option>
                                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialistType}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={lbl}>Appointment ID (optional)</label>
                                <select value={form.appointmentId} onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))} className={inp}>
                                    <option value="">— Not linked to an appointment —</option>
                                    {appointments.map(a => <option key={a._id} value={a.appointmentId}>#{a.appointmentId} — {new Date(a.date).toLocaleDateString('en-IN')}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={lbl}>Preferred Date & Time *</label>
                            <input type="datetime-local" required value={form.preferredTime}
                                onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
                                min={new Date().toISOString().slice(0, 16)} className={inp} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={lbl}>Describe Your Concern *</label>
                            <textarea required rows="3" placeholder="Describe your symptoms or questions…"
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className={`${inp} resize-none`} />
                        </div>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {saving ? 'Sending…' : 'Send Request'}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* ── Doctor reject modal ── */}
            <AnimatePresence>
                {rejectTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-elevated p-8 w-full max-w-md">
                            <h3 className="text-xl font-bold text-red-400 mb-3">Reject Consultation</h3>
                            <p className="text-sm text-gray-400 mb-4">Patient: <strong className="text-white">{rejectTarget.mother?.name}</strong></p>
                            <textarea rows="3" value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                placeholder="Reason for rejection (optional)" className="dark-input resize-none mb-4" />
                            <div className="flex gap-3">
                                <button onClick={() => { setRejectTarget(null); setRejectNote(''); }}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Cancel</button>
                                <button onClick={handleReject} disabled={rejectSaving}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-70 transition-colors">
                                    {rejectSaving ? 'Rejecting…' : 'Confirm Reject'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Consult list ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-white">
                        {isDoctor ? 'Incoming Requests' : 'Your Consultations'}
                    </h2>
                    <span className="text-xs text-gray-600">{consults.length} total</span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-14">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : consults.length === 0 ? (
                    <div className="glass-card p-14 text-center">
                        <Video className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                        <p className="text-white font-bold">No consultations yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {isMother ? 'Use the form above to request your first video consultation.' : 'Incoming patient requests will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {consults.map((c, i) => (
                            <TeleConsultCard
                                key={c._id}
                                consult={c}
                                viewAs={user?.role}
                                index={i}
                                onAccept={handleAccept}
                                onReject={setRejectTarget}
                                onComplete={handleComplete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeleConsult;
