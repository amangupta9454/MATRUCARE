import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Weight } from 'lucide-react';

const GrowthChart = () => {
    const { token } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState('weight');

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/baby/growth`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setRecords(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>;

    if (!records.length) return (
        <div className="glass-card p-10 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p className="text-white font-bold">No growth records yet</p>
            <p className="text-sm text-gray-500 mt-1">Your doctor will add growth measurements during visits.</p>
        </div>
    );

    const METRICS = [
        { key: 'weight', label: 'Weight (kg)', color: '#60efbc', unit: 'kg' },
        { key: 'height', label: 'Height (cm)', color: '#60c0ef', unit: 'cm' },
        { key: 'headCircumference', label: 'Head Circumferece (cm)', color: '#c060ef', unit: 'cm' },
    ];

    const active = METRICS.find(m => m.key === metric);
    const values = records.map(r => r[metric]).filter(Boolean);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-teal-400" /> Baby Growth Chart
                </h3>
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                    {METRICS.map(m => (
                        <button key={m.key} onClick={() => setMetric(m.key)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${metric === m.key ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                            {m.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-3 h-48 mb-4">
                {records.map((r, i) => {
                    const val = r[metric];
                    const barH = val ? ((val - minVal) / range) * 80 + 15 : 5;
                    return (
                        <div key={r._id} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {val ? `${val} ${active.unit}` : 'N/A'}<br />
                                {new Date(r.recordedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </div>
                            <span className="text-xs font-bold text-white mb-1">{val ? val : '—'}</span>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${barH}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                style={{ backgroundColor: active.color + '99', borderColor: active.color }}
                                className="w-full rounded-t-xl border border-opacity-40 min-h-[4px]" />
                            <span className="text-xs text-gray-600 mt-1.5 whitespace-nowrap">
                                {new Date(r.recordedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {[
                    { label: 'Latest', val: values[values.length - 1] },
                    { label: 'Min', val: Math.min(...values) },
                    { label: 'Max', val: Math.max(...values) },
                ].map(s => (
                    <div key={s.label} className="text-center bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className="font-extrabold text-white">{s.val ?? '—'} <span className="text-xs font-normal text-gray-500">{active.unit}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GrowthChart;
