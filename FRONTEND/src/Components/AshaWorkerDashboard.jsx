import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Activity, MapPin, UserCheck, Bell, Shield, FileText } from 'lucide-react';
import VisitLogForm from '../Components/VisitLogForm';

const AshaWorkerDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [connectedDoctors, setConnectedDoctors] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [ashaProfile, setAshaProfile] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [leaveDateInput, setLeaveDateInput] = useState('');
    const [leaveDates, setLeaveDates] = useState([]);
    const [statusLoading, setStatusLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [showLogFor, setShowLogFor] = useState(null);
    const [showLogsFor, setShowLogsFor] = useState(null);
    const [motherLogs, setMotherLogs] = useState([]);
    const [rxMap, setRxMap] = useState({});     // { motherId: [appointment with prescription] }
    const [rxLoading, setRxLoading] = useState({});

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchAssignments = async () => {
        try {
            const [assigRes, todayRes, profileRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/asha/my-assignments`, { headers: authHeader }),
                axios.get(`${import.meta.env.VITE_API_URL}/asha/today-schedule`, { headers: authHeader }).catch(() => ({ data: [] })),
                axios.get(`${import.meta.env.VITE_API_URL}/asha/profile`, { headers: authHeader }).catch(() => ({ data: null }))
            ]);
            setAssignments(assigRes.data.assignments || assigRes.data);
            setConnectedDoctors(assigRes.data.connectedDoctors || []);
            setTodayEvents(todayRes.data || []);
            if (profileRes.data) {
                setAshaProfile(profileRes.data);
                setIsOnline(profileRes.data.isOnlineToday);
                setLeaveDates(profileRes.data.leaveDates ? profileRes.data.leaveDates.map(d => new Date(d).toISOString().split('T')[0]) : []);
            }
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

    const fetchMotherLogs = async (motherId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/asha/logs/${motherId}`, { headers: authHeader });
            setMotherLogs(res.data);
            setShowLogsFor(motherId);
            setShowLogFor(null); // Close log form if open
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleStatus = async () => {
        const action = isOnline ? 'Offline' : 'Online';
        if (!window.confirm(`Are you sure you want to go ${action} today?\n\nGoing offline will CANCEL all your remaining appointments for today and notify the mothers/doctors.`)) return;
        setStatusLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/asha/status`, { isOnlineToday: !isOnline }, { headers: authHeader });
            setIsOnline(!isOnline);
            if (isOnline) {
                alert("You are now offline. Today's appointments have been cancelled and notified.");
                fetchAssignments(); // refresh schedule
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        if (!leaveDateInput) return;
        
        if (leaveDates.includes(leaveDateInput)) {
            alert('Date is already added to leave list.');
            return;
        }

        const newLeaveDates = [...leaveDates, leaveDateInput];
        setStatusLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/asha/leave`, { leaveDates: newLeaveDates }, { headers: authHeader });
            setLeaveDates(newLeaveDates);
            setLeaveDateInput('');
            alert('Leave date added successfully. Any conflicting appointments on this date have been cancelled and notified.');
            fetchAssignments();
        } catch (err) {
            alert('Failed to add leave date');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleRemoveLeave = async (dateToRemove) => {
        if (!window.confirm(`Remove ${dateToRemove} from your leave list?`)) return;
        const newLeaveDates = leaveDates.filter(d => d !== dateToRemove);
        setStatusLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/asha/leave`, { leaveDates: newLeaveDates }, { headers: authHeader });
            setLeaveDates(newLeaveDates);
            alert('Leave date removed successfully.');
        } catch (err) {
            alert('Failed to remove leave date');
        } finally {
            setStatusLoading(false);
        }
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
                <div className="flex gap-3 items-center">
                    {/* Status Toggle */}
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <span className="text-sm font-bold text-slate-700">Status Today:</span>
                        <button 
                            onClick={handleToggleStatus} 
                            disabled={statusLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs font-bold ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>

                    <a href="/chat" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 transition-all shadow-xs">
                        ✉️ Messages
                    </a>
                </div>
            </div>

            {/* Leave Management */}
            <div className="mb-8 glass-card p-6 border border-amber-200 bg-amber-50/50">
                <h3 className="font-extrabold text-amber-900 text-lg mb-4 flex items-center gap-2">🌴 Leave Management</h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <form onSubmit={handleAddLeave} className="flex-1 flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-amber-800 mb-1">Select Future Leave Date</label>
                            <input 
                                type="date" 
                                required 
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} 
                                value={leaveDateInput} 
                                onChange={e => setLeaveDateInput(e.target.value)} 
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                        <button type="submit" disabled={statusLoading || !leaveDateInput} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-50">
                            Add Leave
                        </button>
                    </form>
                    
                    <div className="flex-1 bg-white/60 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">Your Upcoming Leaves</p>
                        {leaveDates.length === 0 ? (
                            <p className="text-sm text-amber-600 italic">No upcoming leaves scheduled.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {leaveDates.sort().map(d => (
                                    <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full border border-amber-300">
                                        {new Date(d).toLocaleDateString('en-IN')}
                                        <button type="button" onClick={() => handleRemoveLeave(d)} className="hover:text-red-500 hover:bg-amber-200 rounded-full p-0.5 transition-colors">
                                            <span className="sr-only">Remove</span>✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
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
                {[['events', "Today's Events"], ['mothers', 'Assigned Mothers']].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-sky-600 text-white shadow-sm' : 'bg-white border border-sky-200 text-slate-600 hover:text-sky-700 hover:bg-sky-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'events' && (
                <div className="space-y-6">
                    {/* Connected Doctors Card */}
                    {connectedDoctors.length > 0 && (
                        <div className="glass-card p-6 border border-sky-200 bg-white/90">
                            <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2"><UserCheck size={18} className="text-sky-600" /> Connected Hospitals & Doctors</h3>
                            <div className="flex flex-wrap gap-4">
                                {connectedDoctors.map(d => (
                                    <div key={d._id} className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center gap-3">
                                        <img src={d.user?.profileImage?.url || 'https://i.pravatar.cc/50'} className="w-10 h-10 rounded-full" alt="Doctor" />
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">Dr. {d.user?.name}</p>
                                            <p className="text-xs text-slate-500">{d.currentOrganization || 'Hospital'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Today's Schedule */}
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Today's Schedule & Travel Times</h2>
                        {todayEvents.length === 0 ? (
                            <div className="glass-card p-14 text-center border border-sky-200 bg-white/90">
                                <ClipboardList className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                                <p className="text-slate-900 font-bold mb-1">No scheduled visits today</p>
                                <p className="text-sm text-slate-500">Enjoy your day or catch up on paperwork.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayEvents.map((evt, idx) => (
                                    <div key={evt._id}>
                                        {/* Travel time indicator if it's not the first event and travelTime is provided */}
                                        {idx > 0 && evt.travelTimeFromPrevious && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 ml-6 my-2">
                                                <div className="h-6 w-0.5 bg-amber-200"></div>
                                                <span className="bg-amber-100 px-2 py-1 rounded-md border border-amber-200">🚗 Travel: {evt.travelTimeFromPrevious}</span>
                                            </div>
                                        )}
                                        
                                        <div className="glass-card p-5 border border-sky-200 bg-white/90 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-sky-100 text-sky-800 border border-sky-300 font-black px-4 py-2 rounded-xl text-center min-w-[90px]">
                                                    {evt.time}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg">{evt.mother?.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {evt.location}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Assigned by: <strong>Dr. {evt.doctor?.name || 'Hospital'}</strong></p>
                                                <p className="text-xs font-bold text-emerald-600 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg mt-2 inline-block">{evt.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                            {p?.emergencyContact?.phone && (
                                                <p className="text-xs text-slate-500 mt-0.5">📞 {p.emergencyContact.phone} ({p.emergencyContact.relation || 'Emergency'})</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {p?.riskLevel && <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskBadge(p.riskLevel)}`}>{p.riskLevel} Risk</span>}
                                        {p?.pregnancyWeek && <span className="text-xs text-slate-600 font-medium">Week {p.pregnancyWeek}</span>}
                                        <button onClick={() => { setShowLogFor(showLogFor === idx ? null : idx); setShowLogsFor(null); }}
                                            className="text-xs bg-sky-100 border border-sky-300 text-sky-800 hover:bg-sky-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1">
                                            <ClipboardList size={12} /> {showLogFor === idx ? 'Cancel' : 'Log Visit'}
                                        </button>
                                        <button onClick={() => showLogsFor === m._id ? setShowLogsFor(null) : fetchMotherLogs(m._id)}
                                            className="text-xs bg-indigo-100 border border-indigo-300 text-indigo-800 hover:bg-indigo-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1">
                                            <FileText size={12} /> {showLogsFor === m._id ? 'Close History' : 'View History'}
                                        </button>
                                    </div>
                                </div>
                                {showLogFor === idx && (
                                    <div className="border-t border-sky-100 p-5">
                                        <VisitLogForm motherId={m?._id} motherName={m?.name} token={token} onSaved={() => { setShowLogFor(null); fetchAssignments(); }} />
                                    </div>
                                )}
                                {showLogsFor === m?._id && (
                                    <div className="border-t border-sky-100 p-5 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><ClipboardList size={16} className="text-sky-600" /> Previous Visit Logs</h4>
                                        {motherLogs.length === 0 ? (
                                            <p className="text-xs text-slate-500">No previous visits recorded.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {motherLogs.map(log => (
                                                    <div key={log._id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-xs font-bold text-slate-700">{new Date(log.visitDate).toLocaleDateString('en-IN')}</p>
                                                            <p className="text-xs text-slate-500">By: <span className="font-semibold text-sky-700">{log.ashaWorker?.name}</span></p>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                                                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                                                <span className="text-slate-400 block text-[10px] uppercase">BP</span>
                                                                <span className="font-medium text-slate-700">{log.bloodPressure || '-'}</span>
                                                            </div>
                                                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                                                <span className="text-slate-400 block text-[10px] uppercase">Weight</span>
                                                                <span className="font-medium text-slate-700">{log.weight ? `${log.weight} kg` : '-'}</span>
                                                            </div>
                                                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                                                <span className="text-slate-400 block text-[10px] uppercase">Hb</span>
                                                                <span className="font-medium text-slate-700">{log.hemoglobin ? `${log.hemoglobin} g/dL` : '-'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs space-y-1">
                                                            {log.observations && <p><strong className="text-slate-600">Obs:</strong> {log.observations}</p>}
                                                            {log.recommendations && <p><strong className="text-slate-600">Rec:</strong> {log.recommendations}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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

        </div>
    );
};

export default AshaWorkerDashboard;