import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { UserCheck, Phone, CalendarDays, ClipboardList } from 'lucide-react';

const AshaAssignmentCard = () => {
    const { token } = useContext(AuthContext);
    const [assignment, setAssignment] = useState(null);
    const [visitLogs, setVisitLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/my-asha`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignment(res.data.ashaWorker);
                setVisitLogs(res.data.visitLogs || []);
            } catch { } finally { setLoading(false); }
        };
        if (token) fetchInfo();
    }, [token]);

    if (loading) return (
        <div className="glass-card p-5 border border-sky-200 bg-white/90">
            <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="glass-card p-5 border border-sky-200 bg-white/90">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sky-100">
                <div className="bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl">
                    <UserCheck size={20} className="text-emerald-700" />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-900">ASHA Worker</h3>
                    <p className="text-xs text-slate-500 font-medium">Your community health worker</p>
                </div>
            </div>

            {assignment ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-lg">
                            {assignment.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{assignment.name}</p>
                            <p className="text-xs text-slate-500">{assignment.email}</p>
                        </div>
                    </div>

                    {visitLogs.length > 0 && (
                        <div className="mt-3 p-3 bg-sky-50/80 rounded-xl border border-sky-200">
                            <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Last Visit</p>
                            <p className="text-sm text-slate-900 font-bold">{new Date(visitLogs[0].visitDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                            {visitLogs[0].nextVisitDate && (
                                <p className="text-xs text-sky-800 font-bold mt-1 flex items-center gap-1">
                                    <CalendarDays size={11} /> Next visit: {new Date(visitLogs[0].nextVisitDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                </p>
                            )}
                            {visitLogs[0].observations && (
                                <p className="text-xs text-slate-600 mt-1.5 italic">"{visitLogs[0].observations}"</p>
                            )}
                        </div>
                    )}

                    <a href="/chat" className="mt-3 w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs">
                        <ClipboardList size={13} /> Message ASHA Worker
                    </a>
                </div>
            ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                    <p className="font-medium">No ASHA worker assigned yet.</p>
                    <p className="text-xs text-slate-500 mt-1">An ASHA worker will be assigned to your area by the admin.</p>
                </div>
            )}
        </div>
    );
};

export default AshaAssignmentCard;
