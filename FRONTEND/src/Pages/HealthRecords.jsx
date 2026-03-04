import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, BrainCircuit, Calendar } from 'lucide-react';

const HealthRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/health-records`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRecords(data.records);
            }
        } catch (error) {
            console.error('Error fetching records', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 md:pb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-96 bg-purple-900/10 blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto space-y-6 relative z-10 pt-16 md:pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-3">
                            <FileText size={32} className="text-purple-400" />
                            Digital Health Records
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your prescriptions, lab reports, and AI-generated summaries securely.</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 w-full md:w-auto justify-center">
                        <Upload size={18} /> Upload Report
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
                ) : records.length > 0 ? (
                    <div className="grid gap-4">
                        {records.map((record, idx) => (
                            <motion.div
                                key={record._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-purple-500/30 transition-all"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FileText size={18} className="text-purple-400" /> {record.reportType}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                        <Calendar size={14} /> {new Date(record.createdAt).toLocaleDateString()}
                                    </p>

                                    <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/5 relative">
                                        <div className="absolute top-3 right-3 text-pink-400/50">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <p className="text-xs font-semibold text-pink-400 mb-1 tracking-wider uppercase">AI Summary</p>
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{record.summary}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-3 md:w-32 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                                    <a href={record.reportUrl} target="_blank" rel="noreferrer" className="w-full text-center bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                                        View Original
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto flex flex-col items-center">
                            Upload your first lab report or prescription to get an AI-powered smart summary.
                            <button className="mt-4 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                Try Demo Upload
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthRecords;
