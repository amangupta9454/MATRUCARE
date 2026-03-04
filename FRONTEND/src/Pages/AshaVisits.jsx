import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Users, ClipboardList, AlertTriangle, Baby, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import VisitLogForm from '../Components/VisitLogForm';

const AshaVisits = () => {
    const { user, token } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [showLogForm, setShowLogForm] = useState(null);

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const r = await axios.get(`${import.meta.env.VITE_API_URL}/asha/my-assignments`, { headers: authHeader });
            setAssignments(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAssignments(); }, [token]);

    const riskColor = l => l === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/30' : l === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-green-400 bg-green-500/10 border-green-500/30';

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white">Field Visits</h1>
                <p className="text-gray-500 mt-1">Welcome, {user?.name}. Manage your assigned mothers and log home visits.</p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Assigned Mothers', value: assignments.length, color: 'border-teal-500/30', textColor: 'text-teal-400' },
                    { label: 'High Risk', value: assignments.filter(a => a.profile?.riskLevel === 'High').length, color: 'border-red-500/30', textColor: 'text-red-400' },
                    { label: 'Visited Recently', value: assignments.filter(a => a.lastVisitDate).length, color: 'border-green-500/30', textColor: 'text-green-400' },
                ].map(s => (
                    <div key={s.label} className={`glass-card p-4 border ${s.color} text-center`}>
                        <p className={`text-3xl font-extrabold ${s.textColor}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Mother List */}
            {assignments.length === 0 ? (
                <div className="glass-card p-14 text-center">
                    <Users className="mx-auto h-14 w-14 text-gray-600 mb-4" />
                    <p className="text-white font-bold mb-1">No assignments yet</p>
                    <p className="text-sm text-gray-500">The admin will assign mothers to you. Check back soon.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((a, idx) => {
                        const m = a.assignment?.mother;
                        const p = a.profile;
                        const isExpanded = expanded === idx;
                        const isLogging = showLogForm === idx;

                        return (
                            <motion.div key={m?._id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="glass-card overflow-hidden">
                                {/* Header row */}
                                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-extrabold text-lg">
                                            {m?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-white">{m?.name}</p>
                                            <p className="text-xs text-gray-500">{m?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {p?.riskLevel && (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColor(p.riskLevel)}`}>{p.riskLevel} Risk</span>
                                        )}
                                        {p?.pregnancyWeek && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Baby size={11} /> Week {p.pregnancyWeek}</span>
                                        )}
                                        {a.nextAncWeek && (
                                            <span className="text-xs text-blue-400 flex items-center gap-1"><CalendarCheck size={11} /> ANC W{a.nextAncWeek}</span>
                                        )}
                                        <button onClick={() => { setShowLogForm(isLogging ? null : idx); setExpanded(null); }}
                                            className="ml-2 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1">
                                            <ClipboardList size={12} /> Log Visit
                                        </button>
                                        <button onClick={() => { setExpanded(isExpanded ? null : idx); setShowLogForm(null); }}
                                            className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Log visit form */}
                                {isLogging && (
                                    <div className="border-t border-white/10 p-5">
                                        <VisitLogForm
                                            motherId={m?._id} motherName={m?.name} token={token}
                                            onSaved={() => { setShowLogForm(null); fetchAssignments(); }}
                                        />
                                    </div>
                                )}

                                {/* Expanded details */}
                                {isExpanded && p && (
                                    <div className="border-t border-white/10 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'BMI', value: p.bmi },
                                            { label: 'Hemoglobin', value: p.hemoglobin ? p.hemoglobin + ' g/dL' : '—' },
                                            { label: 'Risk Score', value: p.riskScore ? p.riskScore + '/100' : '—' },
                                            { label: 'Last Visited', value: a.lastVisitDate ? new Date(a.lastVisitDate).toLocaleDateString('en-IN') : 'Never' },
                                        ].map(s => (
                                            <div key={s.label} className="bg-white/5 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                                <p className="font-bold text-white">{s.value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AshaVisits;
