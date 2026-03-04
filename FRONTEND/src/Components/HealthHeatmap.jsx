import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { MapPin, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

const RISK_COLORS = { High: '#ef4444', Medium: '#eab308', Low: '#22c55e' };

const HealthHeatmap = () => {
    const { token } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/analytics/heatmap`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>;

    const riskGroups = {
        High: data?.profiles?.filter(p => p.riskLevel === 'High') || [],
        Medium: data?.profiles?.filter(p => p.riskLevel === 'Medium') || [],
        Low: data?.profiles?.filter(p => p.riskLevel === 'Low') || [],
    };

    return (
        <div className="space-y-5">
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(RISK_COLORS).map(([level, color]) => (
                    <div key={level} className="flex items-center gap-2 text-xs font-bold text-white">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        {level} Risk ({riskGroups[level].length})
                    </div>
                ))}
            </div>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: 380 }}>
                <iframe
                    title="Health Risk Map"
                    src="https://maps.google.com/maps?q=India+maternal+health&output=embed&z=5"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                />
                {/* Overlay legend */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-bold text-white mb-2">Risk Distribution</p>
                    {Object.entries(riskGroups).map(([level, mothers]) => (
                        <div key={level} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
                            <span className="text-xs text-gray-300">{level}: <span className="font-bold text-white">{mothers.length}</span></span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk table */}
            {(data?.profiles?.length || 0) > 0 ? (
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10">
                        <h4 className="font-bold text-white flex items-center gap-2"><AlertTriangle size={15} className="text-yellow-400" /> Patient Risk Summary</h4>
                    </div>
                    <div className="divide-y divide-white/5">
                        {data.profiles.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[p.riskLevel] }} />
                                <span className="text-sm text-white font-medium flex-1">{p.name || 'Anonymous'}</span>
                                <span className="text-xs text-gray-500">Week {p.pregnancyWeek || '—'}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: RISK_COLORS[p.riskLevel], backgroundColor: RISK_COLORS[p.riskLevel] + '20' }}>
                                    {p.riskLevel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                    <Info size={20} />
                    <p className="text-sm">No pregnancy profiles with location data yet.</p>
                </div>
            )}
        </div>
    );
};

export default HealthHeatmap;
