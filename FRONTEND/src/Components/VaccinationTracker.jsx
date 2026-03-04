import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe, CheckCircle2, Clock, Upload, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const VaccinationTracker = () => {
    const { token } = useContext(AuthContext);
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [uploading, setUploading] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchVaccines = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/baby-vaccines`, { headers: authHeader })
            .then(r => setVaccines(r.data)).catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchVaccines(); }, [token]);

    const markDone = async (vaccineName) => {
        setUploading(vaccineName); setError('');
        try {
            const fd = new FormData();
            fd.append('vaccineName', vaccineName);
            if (file) fd.append('proof', file);
            await axios.put(`${import.meta.env.VITE_API_URL}/baby-vaccines/mark`, fd, { headers: authHeader });
            setFile(null); fetchVaccines();
        } catch (err) { setError(err.response?.data?.message || 'Error marking vaccine'); }
        finally { setUploading(null); }
    };

    const today = new Date();
    const overdue = vaccines.filter(v => !v.completed && new Date(v.dueDate) < today);
    const upcoming = vaccines.filter(v => !v.completed && new Date(v.dueDate) >= today);
    const done = vaccines.filter(v => v.completed);

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>;

    if (!vaccines.length) return (
        <div className="glass-card p-10 text-center">
            <Syringe className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p className="text-white font-bold">No vaccination schedule yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a baby profile first to generate the vaccination schedule.</p>
        </div>
    );

    const Section = ({ title, items, accentColor }) => (
        <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accentColor}`}>{title} ({items.length})</h4>
            <div className="space-y-2">
                {items.map((v, i) => {
                    const isExp = expanded === v._id;
                    return (
                        <div key={v._id} className={`glass-card overflow-hidden border ${v.completed ? 'border-green-500/20' : new Date(v.dueDate) < today ? 'border-red-500/30' : 'border-white/10'}`}>
                            <button onClick={() => setExpanded(isExp ? null : v._id)} className="w-full flex items-center justify-between p-4 text-left">
                                <div className="flex items-center gap-3">
                                    {v.completed
                                        ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                                        : new Date(v.dueDate) < today
                                            ? <AlertCircle size={16} className="text-red-400 shrink-0" />
                                            : <Clock size={16} className="text-blue-400 shrink-0" />}
                                    <div>
                                        <p className="font-bold text-white text-sm">{v.vaccineName}</p>
                                        <p className="text-xs text-gray-500">
                                            {v.completed ? `Done: ${new Date(v.completedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`
                                                : `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!v.completed && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${new Date(v.dueDate) < today ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
                                        {new Date(v.dueDate) < today ? 'Overdue' : 'Upcoming'}
                                    </span>}
                                    {v.completed && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">Done ✓</span>}
                                    {isExp ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExp && !v.completed && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10 px-4 pb-4 pt-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <label className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors">
                                                <Upload size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-400">{file ? file.name : 'Upload proof (optional)'}</span>
                                                <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files[0])} className="hidden" />
                                            </label>
                                            <button onClick={() => markDone(v.vaccineName)} disabled={uploading === v.vaccineName}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70">
                                                {uploading === v.vaccineName ? <div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" /> : <CheckCircle2 size={14} />}
                                                Mark Done
                                            </button>
                                        </div>
                                        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                                    </motion.div>
                                )}
                                {isExp && v.completed && v.proofUrl && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10 px-4 pb-4 pt-3">
                                        <a href={v.proofUrl} target="_blank" rel="noreferrer" className="text-sm text-teal-400 underline flex items-center gap-1">
                                            View Proof →
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {overdue.length > 0 && <Section title="⚠️ Overdue" items={overdue} accentColor="text-red-400" />}
            {upcoming.length > 0 && <Section title="📅 Upcoming" items={upcoming} accentColor="text-blue-400" />}
            {done.length > 0 && <Section title="✅ Completed" items={done} accentColor="text-green-400" />}
        </div>
    );
};

export default VaccinationTracker;
