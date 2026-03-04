import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Pill, Plus, Trash2, Loader2, Clock, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';

const FREQ = ['Once daily', 'Twice daily', 'Thrice daily', 'Every 8 hours', 'Every 12 hours', 'As needed'];
const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const MedicineReminder = () => {
    const { token } = useContext(AuthContext);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ medicineName: '', dosage: '', frequency: 'Once daily', startDate: '', endDate: '', notes: '' });

    const authHeader = { Authorization: `Bearer ${token}` };
    const today = new Date().toISOString().split('T')[0];

    const fetchMeds = async () => {
        try {
            const r = await axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/medicines`, { headers: authHeader });
            setMedicines(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchMeds(); }, [token]);

    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/pregnancy/medicines`, form, { headers: authHeader });
            setForm({ medicineName: '', dosage: '', frequency: 'Once daily', startDate: '', endDate: '', notes: '' });
            setShowForm(false); fetchMeds();
        } catch (err) { setError(err.response?.data?.message || 'Failed to add medicine'); }
        finally { setSaving(false); }
    };

    const handleDelete = async id => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pregnancy/medicines/${id}`, { headers: authHeader });
            fetchMeds();
        } catch { alert('Failed to delete'); }
    };

    const daysLeft = (endDate) => {
        const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2"><Pill size={18} className="text-purple-400" /> Medicine Reminders</h3>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all">
                    <Plus size={16} />{showForm ? 'Cancel' : 'Add Medicine'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={15} />{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5"><label className={lbl}>Medicine Name</label><input required type="text" placeholder="e.g. Folic Acid" value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))} className={inp} /></div>
                            <div className="space-y-1.5"><label className={lbl}>Dosage</label><input required type="text" placeholder="e.g. 5mg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} className={inp} /></div>
                            <div className="space-y-1.5"><label className={lbl}>Frequency</label>
                                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className={inp}>
                                    {FREQ.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5"><label className={lbl}>Start Date</label><input required type="date" min={today} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inp} /></div>
                            <div className="space-y-1.5"><label className={lbl}>End Date</label><input required type="date" min={form.startDate || today} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inp} /></div>
                            <div className="space-y-1.5"><label className={lbl}>Notes</label><input type="text" placeholder="e.g. After meals" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inp} /></div>
                        </div>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{saving ? 'Saving...' : 'Add Medicine'}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* List */}
            {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>
                : medicines.length === 0 ? <div className="glass-card p-10 text-center text-gray-500">No medicines added yet.</div>
                    : (
                        <div className="space-y-3">
                            {medicines.map(m => {
                                const left = daysLeft(m.endDate);
                                const isActive = left >= 0 && new Date(m.startDate) <= new Date();
                                return (
                                    <motion.div key={m._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isActive ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                        <div className={`p-3 rounded-xl shrink-0 ${isActive ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 border border-white/10'}`}>
                                            <Pill size={18} className={isActive ? 'text-purple-400' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white">{m.medicineName} <span className="text-purple-400 text-sm">({m.dosage})</span></p>
                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Clock size={11} />{m.frequency}</span>
                                                <span className="flex items-center gap-1"><CalendarDays size={11} />{new Date(m.startDate).toLocaleDateString('en-IN')} — {new Date(m.endDate).toLocaleDateString('en-IN')}</span>
                                                {isActive && <span className={`font-bold ${left <= 3 ? 'text-red-400' : 'text-green-400'}`}>{left}d remaining</span>}
                                                {!isActive && left < 0 && <span className="text-gray-600">Completed</span>}
                                            </div>
                                            {m.notes && <p className="text-xs text-gray-600 mt-0.5">{m.notes}</p>}
                                        </div>
                                        <button onClick={() => handleDelete(m._id)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all shrink-0"><Trash2 size={14} /></button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
        </div>
    );
};

export default MedicineReminder;
