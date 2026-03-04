import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ClipboardList, Save, Loader2, WifiOff, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';

const OFFLINE_KEY = 'maacare_offline_visits';
const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const VisitLogForm = ({ motherId, motherName, token, onSaved }) => {
    const [form, setForm] = useState({
        motherId: motherId || '',
        visitDate: new Date().toISOString().split('T')[0],
        bloodPressure: '', weight: '', hemoglobin: '',
        observations: '', recommendations: '',
        nextVisitDate: '',
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlinePending, setOfflinePending] = useState(0);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    // Track online status
    useEffect(() => {
        const goOnline = async () => {
            setIsOnline(true);
            await syncOfflineVisits(); // auto-sync on reconnect
        };
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        // Count pending
        const pending = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
        setOfflinePending(pending.length);

        return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
    }, []);

    const syncOfflineVisits = async () => {
        const pending = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
        if (!pending.length) return;
        let synced = 0;
        const remaining = [];
        for (const visit of pending) {
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/asha/log-visit`, { ...visit, syncedFromOffline: true }, { headers: { Authorization: `Bearer ${token}` } });
                synced++;
            } catch { remaining.push(visit); }
        }
        localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
        setOfflinePending(remaining.length);
        if (synced > 0) setSuccess(`${synced} offline visit(s) synced successfully!`);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true); setError(''); setSuccess('');

        if (!isOnline) {
            // Save to localStorage
            const pending = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
            pending.push({ ...form, savedOfflineAt: new Date().toISOString() });
            localStorage.setItem(OFFLINE_KEY, JSON.stringify(pending));
            setOfflinePending(pending.length);
            setSuccess('Saved offline! Will sync automatically when internet returns.');
            setSaving(false);
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/asha/log-visit`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Visit logged successfully! Summary sent to doctor.');
            setForm(f => ({ ...f, bloodPressure: '', weight: '', hemoglobin: '', observations: '', recommendations: '', nextVisitDate: '' }));
            if (onSaved) onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log visit');
        } finally { setSaving(false); }
    };

    return (
        <div className="glass-card p-6">
            {/* Offline indicator */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <ClipboardList size={18} className="text-blue-400" /> {motherName ? `Log Visit — ${motherName}` : 'Log Home Visit'}
                </h3>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {isOnline ? 'Online' : `Offline Mode — ${offlinePending} pending`}
                </div>
            </div>

            {!isOnline && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-300 text-sm">
                    <WifiOff size={14} className="inline mr-2" />
                    No internet detected. Data will be saved locally and synced when you reconnect.
                </div>
            )}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className={lbl}>Visit Date</label><input type="date" name="visitDate" required value={form.visitDate} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Blood Pressure</label><input type="text" name="bloodPressure" placeholder="e.g. 120/80 mmHg" value={form.bloodPressure} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Weight (kg)</label><input type="number" name="weight" step="0.1" placeholder="e.g. 65.5" value={form.weight} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Hemoglobin (g/dL)</label><input type="number" name="hemoglobin" step="0.1" placeholder="e.g. 11.2" value={form.hemoglobin} onChange={handleChange} className={inp} /></div>
                </div>
                <div className="space-y-1.5"><label className={lbl}>Observations</label><textarea name="observations" rows="2" placeholder="Any notable health observations..." value={form.observations} onChange={handleChange} className={`${inp} resize-none`} /></div>
                <div className="space-y-1.5"><label className={lbl}>Recommendations</label><textarea name="recommendations" rows="2" placeholder="Advice given to mother..." value={form.recommendations} onChange={handleChange} className={`${inp} resize-none`} /></div>
                <div className="space-y-1.5"><label className={lbl}>Next Visit Date</label><input type="date" name="nextVisitDate" value={form.nextVisitDate} onChange={handleChange} className={inp} /></div>

                <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : isOnline ? 'Submit Visit Log' : 'Save Offline'}
                    </button>
                    {offlinePending > 0 && isOnline && (
                        <button type="button" onClick={syncOfflineVisits} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold transition-all text-sm">
                            <Wifi size={14} /> Sync {offlinePending} Offline
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default VisitLogForm;
