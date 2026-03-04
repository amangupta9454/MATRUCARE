import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Users, Stethoscope, HeartPulse, CalendarDays, AlertTriangle, TrendingUp, CheckCircle2, Map } from 'lucide-react';
import HealthHeatmap from '../Components/HealthHeatmap';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`glass-card p-5 border ${color}`}>
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            <Icon size={18} className="text-gray-500" />
        </div>
        <p className="text-3xl font-extrabold text-white">{value ?? <span className="text-gray-600">—</span>}</p>
    </motion.div>
);

const BarChart = ({ data = [], maxVal, color = 'bg-teal-500' }) => (
    <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
            const pct = maxVal > 0 ? (d.count / maxVal) * 100 : 0;
            return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-white">{d.count}</span>
                    <div style={{ height: `${Math.max(4, pct)}%` }} className={`w-full rounded-t-lg transition-all duration-700 ${pct > 0 ? color : 'bg-white/5'}`} />
                    <span className="text-xs text-gray-600">{d.label}</span>
                </div>
            );
        })}
    </div>
);

const Analytics = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/analytics/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => setStats(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" /></div>;

    const maxMonthly = Math.max(...(stats?.monthlyAppointments?.map(m => m.count) || [1]));
    const totalRisk = (stats?.riskDistribution?.high || 0) + (stats?.riskDistribution?.medium || 0) + (stats?.riskDistribution?.low || 0);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white">Maternal Health Analytics</h1>
                <p className="text-gray-500 mt-1">Real-time statistics across the MaaCare platform</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {[['overview', 'Overview'], ['charts', 'Charts'], ['heatmap', 'Risk Heatmap']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === id ? 'bg-teal-600 text-white' : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={Users} label="Total Mothers" value={stats?.totals?.mothers} color="border-pink-500/30" />
                        <StatCard icon={Stethoscope} label="Total Doctors" value={stats?.totals?.doctors} color="border-blue-500/30" />
                        <StatCard icon={HeartPulse} label="ASHA Workers" value={stats?.totals?.ashaWorkers} color="border-green-500/30" />
                        <StatCard icon={CalendarDays} label="Total Appointments" value={stats?.totals?.appointments} color="border-purple-500/30" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'High Risk', count: stats?.riskDistribution?.high, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
                            { label: 'Medium Risk', count: stats?.riskDistribution?.medium, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
                            { label: 'Low Risk', count: stats?.riskDistribution?.low, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
                        ].map(r => (
                            <div key={r.label} className={`glass-card border p-5 ${r.border} ${r.bg}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{r.label}</p>
                                <p className={`text-4xl font-extrabold ${r.color}`}>{r.count ?? 0}</p>
                                <p className="text-xs text-gray-600 mt-1">{totalRisk > 0 ? Math.round(((r.count || 0) / totalRisk) * 100) : 0}% of all pregnancies</p>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="font-extrabold text-white mb-3 flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400" /> ANC Completion Rate</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.ancCompletionRate || 0}%` }} transition={{ duration: 1.2 }}
                                    className={`h-full rounded-full ${(stats?.ancCompletionRate || 0) >= 70 ? 'bg-green-500' : (stats?.ancCompletionRate || 0) >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            </div>
                            <span className="text-2xl font-extrabold text-white shrink-0">{stats?.ancCompletionRate || 0}%</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'charts' && stats && (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-extrabold text-white mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-teal-400" /> Monthly Appointments (Last 6 Months)</h3>
                        <p className="text-xs text-gray-600 mb-6">Total appointments booked per month</p>
                        <BarChart data={stats.monthlyAppointments} maxVal={maxMonthly} color="bg-teal-500" />
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-extrabold text-white mb-5 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-400" /> Risk Distribution</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'High Risk', count: stats.riskDistribution?.high || 0, total: totalRisk, color: 'bg-red-500' },
                                { label: 'Medium Risk', count: stats.riskDistribution?.medium || 0, total: totalRisk, color: 'bg-yellow-500' },
                                { label: 'Low Risk', count: stats.riskDistribution?.low || 0, total: totalRisk, color: 'bg-green-500' },
                            ].map(r => (
                                <div key={r.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-400 font-medium">{r.label}</span>
                                        <span className="text-white font-bold">{r.count} patients</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${r.total > 0 ? (r.count / r.total) * 100 : 0}%` }} transition={{ duration: 1 }}
                                            className={`h-full rounded-full ${r.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'heatmap' && (
                <div className="glass-card p-6">
                    <h3 className="font-extrabold text-white mb-2 flex items-center gap-2"><Map size={16} className="text-red-400" /> High-Risk Pregnancy Heatmap</h3>
                    <p className="text-xs text-gray-600 mb-5">GPS locations from emergency events, color-coded by risk level</p>
                    <HealthHeatmap />
                </div>
            )}
        </div>
    );
};

export default Analytics;
