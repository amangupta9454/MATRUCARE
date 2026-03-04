import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { BarChart2, Baby, Syringe, CalendarDays, Download, Loader2, TrendingUp } from 'lucide-react';

const Stat = ({ label, value, sub, color = 'border-white/10' }) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`glass-card p-5 border ${color}`}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-extrabold text-white">{value ?? <span className="text-gray-600">—</span>}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
);

const MiniBar = ({ value, max, color }) => (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden w-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} transition={{ duration: 0.9 }}
            className={`h-full rounded-full ${color}`} />
    </div>
);

const Insights = () => {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState('');

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/insights/advanced`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/insights/export?type=${type}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url;
            a.download = `maacare_${type}_${Date.now()}.csv`; a.click();
            URL.revokeObjectURL(url);
        } catch (e) { alert('Export failed. Please try again.'); }
        finally { setExporting(''); }
    };

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" /></div>;

    const maxBirth = Math.max(...(data?.births?.monthly?.map(m => m.count) || [1]));

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white">Advanced Health Insights</h1>
                <p className="text-gray-500 mt-1">Comprehensive analytics for health authority reporting</p>
            </div>

            {/* Birth Statistics */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Birth Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Stat label="Total Births Recorded" value={data?.births?.total} color="border-pink-500/30" />
                <Stat label="Avg Birth Weight" value={data?.births?.avgBirthWeight ? `${data.births.avgBirthWeight} kg` : null} color="border-rose-500/30" />
                <Stat label="Vaccination Rate" value={data?.vaccination?.completionRate != null ? `${data.vaccination.completionRate}%` : null} color="border-purple-500/30" />
            </div>

            {/* Monthly births chart */}
            {data?.births?.monthly?.length > 0 && (
                <div className="glass-card p-6 mb-8">
                    <h3 className="font-extrabold text-white mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-pink-400" /> Monthly Deliveries (Last 6 Months)</h3>
                    <p className="text-xs text-gray-600 mb-6">Number of babies born registered on MaaCare per month</p>
                    <div className="flex items-end gap-3 h-36">
                        {data.births.monthly.map((m, i) => {
                            const pct = maxBirth > 0 ? (m.count / maxBirth) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-white">{m.count}</span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, pct)}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                        style={{ backgroundColor: '#f472b6' }} className="w-full rounded-t-xl opacity-80" />
                                    <span className="text-xs text-gray-600">{m.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Completion rates */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Completion Rates</h2>
            <div className="glass-card p-6 mb-8">
                {[
                    { label: 'Baby Vaccination Rate', done: data?.vaccination?.completed, total: data?.vaccination?.total, rate: data?.vaccination?.completionRate, color: 'bg-purple-500' },
                    { label: 'ANC Visit Completion', done: data?.anc?.completed, total: data?.anc?.total, rate: data?.anc?.completionRate, color: 'bg-blue-500' },
                ].map(r => (
                    <div key={r.label} className="mb-5 last:mb-0">
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-400 font-medium">{r.label}</span>
                            <span className="text-white font-bold">{r.rate ?? 0}% <span className="text-xs text-gray-600">({r.done || 0}/{r.total || 0})</span></span>
                        </div>
                        <MiniBar value={r.done || 0} max={r.total || 1} color={r.color} />
                    </div>
                ))}
            </div>

            {/* Export buttons */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Data Export (CSV)</h2>
            <div className="glass-card p-6">
                <p className="text-sm text-gray-400 mb-4">Export records for health authority reporting. Files download as CSV and are compatible with Excel.</p>
                <div className="flex flex-wrap gap-3">
                    {[
                        { type: 'pregnancies', label: 'Pregnancy Records', color: 'bg-pink-600 hover:bg-pink-500' },
                        { type: 'vaccinations', label: 'Vaccination Data', color: 'bg-purple-600 hover:bg-purple-500' },
                        { type: 'appointments', label: 'Appointment History', color: 'bg-blue-600 hover:bg-blue-500' },
                    ].map(e => (
                        <button key={e.type} onClick={() => handleExport(e.type)} disabled={!!exporting}
                            className={`flex items-center gap-2 ${e.color} text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70`}>
                            {exporting === e.type ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {e.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Insights;
