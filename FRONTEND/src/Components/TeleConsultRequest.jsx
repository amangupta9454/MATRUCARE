import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Video, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Send, AlertCircle } from 'lucide-react';

const STATUS_THEME = {
    Pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock },
    Accepted: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2 },
    Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
    Rescheduled: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: RefreshCw },
};

const TeleConsultRequest = () => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [consults, setConsults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ doctorId: '', description: '', preferredTime: '' });

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const [docRes, consultRes] = await Promise.allSettled([
                axios.get(`${import.meta.env.VITE_API_URL}/doctors`, { headers: authHeader }),
                axios.get(`${import.meta.env.VITE_API_URL}/teleconsult/my`, { headers: authHeader }),
            ]);
            if (docRes.status === 'fulfilled') {
                setDoctors(docRes.value.data.filter(d => d.approved));
            }
            if (consultRes.status === 'fulfilled') setConsults(consultRes.value.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/teleconsult`, form, { headers: authHeader });
            setSuccess('Tele-consultation requested! The doctor has been notified via email.');
            setForm({ doctorId: '', description: '', preferredTime: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Error sending request'); }
        finally { setSaving(false); }
    };

    const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
    const inp = "dark-input";

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            {/* Request form */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-indigo-500/20">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-indigo-500/20 border border-indigo-500/30 p-2.5 rounded-xl"><Video size={18} className="text-indigo-400" /></div>
                    <div>
                        <h3 className="font-extrabold text-white text-xl">Request Tele-Consultation</h3>
                        <p className="text-xs text-gray-500">Remote consultation request — doctor will confirm via email</p>
                    </div>
                </div>

                {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{success}</div>}
                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className={lbl}>Select Doctor *</label>
                        <select required value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className={inp}>
                            <option value="">Choose a doctor...</option>
                            {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialistType}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className={lbl}>Preferred Date & Time *</label>
                        <input type="datetime-local" required value={form.preferredTime} onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))} className={inp}
                            min={new Date().toISOString().slice(0, 16)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={lbl}>Describe Your Concern *</label>
                        <textarea required rows="3" placeholder="Describe your symptoms or questions..." value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inp} resize-none`} />
                    </div>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {saving ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </motion.div>

            {/* Previous requests */}
            {consults.length > 0 && (
                <div>
                    <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Your Requests</h4>
                    <div className="space-y-3">
                        {consults.map(c => {
                            const theme = STATUS_THEME[c.status] || STATUS_THEME.Pending;
                            const Icon = theme.icon;
                            return (
                                <div key={c._id} className={`glass-card p-4 border ${theme.border}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-white text-sm">Dr. {c.doctor?.user?.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{c.description?.slice(0, 80)}{c.description?.length > 80 ? '...' : ''}</p>
                                            <p className="text-xs text-gray-600 mt-1">Preferred: {new Date(c.preferredTime).toLocaleString('en-IN')}</p>
                                            {c.doctorNote && <p className="text-xs text-indigo-300 mt-1.5 italic">Doctor: "{c.doctorNote}"</p>}
                                            {c.newTime && <p className="text-xs text-blue-400 mt-0.5">New time: {new Date(c.newTime).toLocaleString('en-IN')}</p>}
                                        </div>
                                        <span className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${theme.bg} ${theme.border} ${theme.color}`}>
                                            <Icon size={11} />{c.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeleConsultRequest;
