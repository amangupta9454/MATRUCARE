import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { UserCheck, MapPin, Phone, CalendarDays, AlertCircle } from 'lucide-react';

const AshaAssignmentCard = () => {
    const { token } = useContext(AuthContext);
    const [assignment, setAssignment] = useState(null);
    const [visitLogs, setVisitLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get ASHA assignments for this mother — check via my-visits
                const logsRes = await axios.get(`${import.meta.env.VITE_API_URL}/asha/my-visits`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVisitLogs(logsRes.data || []);
                if (logsRes.data.length > 0) {
                    setAssignment(logsRes.data[0].ashaWorker);
                }
            } catch { } finally { setLoading(false); }
        };
        fetchData();
    }, [token]);

    if (loading) return (
        <div className="glass-card p-5 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500" />
            <span className="text-gray-500 text-sm">Loading ASHA info...</span>
        </div>
    );

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="bg-green-500/20 border border-green-500/30 p-2.5 rounded-xl">
                    <UserCheck size={20} className="text-green-400" />
                </div>
                <div>
                    <h3 className="font-extrabold text-white">ASHA Worker</h3>
                    <p className="text-xs text-gray-500">Your community health worker</p>
                </div>
            </div>

            {assignment ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-extrabold text-lg">
                            {assignment.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-white">{assignment.name}</p>
                            <p className="text-xs text-gray-500">{assignment.email}</p>
                        </div>
                    </div>

                    {visitLogs.length > 0 && (
                        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Last Visit</p>
                            <p className="text-sm text-white font-bold">{new Date(visitLogs[0].visitDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                            {visitLogs[0].nextVisitDate && (
                                <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                                    <CalendarDays size={11} /> Next visit: {new Date(visitLogs[0].nextVisitDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                </p>
                            )}
                            {visitLogs[0].observations && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">"{visitLogs[0].observations}"</p>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-600 flex items-center gap-1"><AlertCircle size={11} /> {visitLogs.length} visit{visitLogs.length !== 1 ? 's' : ''} recorded</p>
                </div>
            ) : (
                <div className="text-center py-4">
                    <MapPin size={28} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No ASHA worker assigned yet.</p>
                    <p className="text-xs text-gray-600 mt-1">Contact your nearest health centre or ask your doctor.</p>
                </div>
            )}
        </div>
    );
};

export default AshaAssignmentCard;
