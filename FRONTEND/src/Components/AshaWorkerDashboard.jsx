import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Activity, MapPin, UserCheck, Bell, Shield, FileText } from 'lucide-react';
import VisitLogForm from '../Components/VisitLogForm';
import EmergencyRequestButton from '../Components/EmergencyRequestButton';

const AshaWorkerDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mothers');
    const [showLogFor, setShowLogFor] = useState(null);
    const [rxMap, setRxMap] = useState({});     // { motherId: [appointment with prescription] }
    const [rxLoading, setRxLoading] = useState({});

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchAssignments = async () => {
        try {
            const r = await axios.get(`${import.meta.env.VITE_API_URL}/asha/my-assignments`, { headers: authHeader });
            setAssignments(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAssignments(); }, [token]);

    // Lazy-load prescriptions for a mother when card is expanded
    const fetchPrescriptions = async (motherId) => {
        if (rxMap[motherId] !== undefined) return; // already fetched
        setRxLoading(l => ({ ...l, [motherId]: true }));
        try {
            const r = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`, { headers: authHeader });
            // Server returns appointments for the logged-in user's context — ASHA workers see all assigned mothers' appointments
            const withRx = r.data.filter(a => a.mother === motherId && a.prescription?.url);
            setRxMap(m => ({ ...m, [motherId]: withRx }));
        } catch { setRxMap(m => ({ ...m, [motherId]: [] })); }
        finally { setRxLoading(l => ({ ...l, [motherId]: false })); }
    };

    const riskBadge = l => ({
        High: 'bg-red-500/10    border-red-500/30    text-red-400',
        Medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        Low: 'bg-green-500/10  border-green-500/30  text-green-400',
    }[l] || 'bg-gray-500/10 border-gray-500/30 text-gray-400');

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
    );

    const highRisk = assignments.filter(a => a.profile?.riskLevel === 'High');

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">ASHA Worker Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome, <span className="font-bold text-sky-800">{user?.name}</span>. Manage field visits and monitor assigned mothers.</p>
                </div>
                <div className="flex gap-3">
                    <a href="/chat" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 transition-all shadow-xs">
                        ✉️ Messages
                    </a>
                </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Users, label: 'Assigned Mothers', value: assignments.length, color: 'border-sky-300 bg-sky-50/80', text: 'text-sky-800' },
                    { icon: Shield, label: 'High Risk', value: highRisk.length, color: 'border-rose-300 bg-rose-50/80', text: 'text-rose-700' },
                    { icon: UserCheck, label: 'Visited', value: assignments.filter(a => a.lastVisitDate).length, color: 'border-emerald-300 bg-emerald-50/80', text: 'text-emerald-800' },
                    { icon: Bell, label: 'Next ANC Due', value: assignments.filter(a => a.nextAncWeek).length, color: 'border-indigo-300 bg-indigo-50/80', text: 'text-indigo-800' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`glass-card p-4 border ${s.color}`}>
                            <div className="flex justify-between mb-2"><p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{s.label}</p><Icon size={16} className="text-slate-500" /></div>
                            <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* High risk alert */}
            {highRisk.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-rose-100 border border-rose-300 rounded-2xl flex items-start gap-3">
                    <Activity size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-rose-900">⚠️ {highRisk.length} High-Risk Mother{highRisk.length > 1 ? 's' : ''} Need Immediate Attention</p>
                        <p className="text-xs text-rose-700 mt-0.5 font-medium">{highRisk.map(a => a.assignment?.mother?.name).join(', ')}</p>
                    </div>
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[['mothers', 'Assigned Mothers'], ['emergency', 'Emergency']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-sky-600 text-white shadow-sm' : 'bg-white border border-sky-200 text-slate-600 hover:text-sky-700 hover:bg-sky-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'mothers' && (
                <div className="space-y-4">
                    {assignments.length === 0 ? (
                        <div className="glass-card p-14 text-center border border-sky-200 bg-white/90">
                            <Users className="mx-auto h-14 w-14 text-slate-400 mb-4" />
                            <p className="text-slate-900 font-bold mb-1">No assignments yet</p>
                            <p className="text-sm text-slate-500">Admin will assign mothers once they register.</p>
                        </div>
                    ) : assignments.map((a, idx) => {
                        const m = a.assignment?.mother;
                        const p = a.profile;
                        return (
                            <motion.div key={m?._id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="glass-card border border-sky-200 bg-white/90">
                                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center font-black text-xl text-pink-700">
                                            {m?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900">{m?.name}</p>
                                            <p className="text-xs text-slate-500">{m?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {p?.riskLevel && <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskBadge(p.riskLevel)}`}>{p.riskLevel} Risk</span>}
                                        {p?.pregnancyWeek && <span className="text-xs text-slate-600 font-medium">Week {p.pregnancyWeek}</span>}
                                        <button onClick={() => setShowLogFor(showLogFor === idx ? null : idx)}
                                            className="text-xs bg-sky-100 border border-sky-300 text-sky-800 hover:bg-sky-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1">
                                            <ClipboardList size={12} /> {showLogFor === idx ? 'Cancel' : 'Log Visit'}
                                        </button>
                                    </div>
                                </div>
                                {showLogFor === idx && (
                                    <div className="border-t border-sky-100 p-5">
                                        <VisitLogForm motherId={m?._id} motherName={m?.name} token={token} onSaved={() => { setShowLogFor(null); fetchAssignments(); }} />
                                    </div>
                                )}
                                {p && (
                                    <div className="border-t border-sky-100 px-5 py-3 flex flex-wrap gap-5 text-xs text-slate-600">
                                        {p.hemoglobin && <span>Hb: <strong className="text-slate-900">{p.hemoglobin} g/dL</strong></span>}
                                        {p.bmi && <span>BMI: <strong className="text-slate-900">{p.bmi}</strong></span>}
                                        {a.nextAncWeek && <span>Next ANC: <strong className="text-sky-700">Week {a.nextAncWeek}</strong></span>}
                                        {a.lastVisitDate && <span>Last visited: <strong className="text-slate-900">{new Date(a.lastVisitDate).toLocaleDateString('en-IN')}</strong></span>}
                                        {!a.lastVisitDate && <span className="text-amber-700 font-semibold">⚠ Not yet visited</span>}

                                        {/* Prescription links */}
                                        <button onClick={() => fetchPrescriptions(m?._id)}
                                            className="ml-auto flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold transition-colors">
                                            <FileText size={12} /> Prescriptions
                                        </button>
                                        {rxLoading[m?._id] && <span className="text-gray-600">Loading…</span>}
                                        {rxMap[m?._id]?.length === 0 && <span className="text-gray-600">No prescriptions yet</span>}
                                        {rxMap[m?._id]?.map(apt => (
                                            <a key={apt._id} href={apt.prescription.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1 text-teal-400 hover:underline">
                                                <FileText size={11} /> #{apt.appointmentId}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'emergency' && (
                <EmergencyRequestButton />
            )}
        </div>
    );
};

export default AshaWorkerDashboard;
