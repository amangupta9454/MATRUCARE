import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Trash2, Loader2, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

const REPORT_TYPES = ['Blood Test', 'Ultrasound', 'Urine Test', 'Hemoglobin', 'Blood Pressure', 'Other'];
const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const ReportUpload = () => {
    const { token } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ reportName: '', reportType: 'Blood Test', notes: '' });

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchReports = async () => {
        try {
            const r = await axios.get(`${import.meta.env.VITE_API_URL}/reports`, { headers: authHeader });
            setReports(r.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchReports(); }, [token]);

    const handleUpload = async e => {
        e.preventDefault();
        if (!file) { setError('Please select a file'); return; }
        setUploading(true); setError(''); setSuccess('');
        const data = new FormData();
        data.append('report', file);
        data.append('reportName', form.reportName || file.name);
        data.append('reportType', form.reportType);
        data.append('notes', form.notes);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/reports`, data, {
                headers: { ...authHeader, 'Content-Type': 'multipart/form-data' }
            });
            setFile(null); setForm({ reportName: '', reportType: 'Blood Test', notes: '' });
            setSuccess('Report uploaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
            fetchReports();
        } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this report?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/reports/${id}`, { headers: authHeader });
            fetchReports();
        } catch { alert('Delete failed'); }
    };

    return (
        <div className="space-y-6">
            {/* Upload Form */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2"><UploadCloud size={18} className="text-teal-400" /> Upload Lab Report</h3>
                {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={15} />{success}</div>}
                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={15} />{error}</div>}
                <form onSubmit={handleUpload} className="space-y-4">
                    {/* Drag zone */}
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                        <UploadCloud className="w-7 h-7 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">{file ? file.name : 'Click to select PDF / Image'}</p>
                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} />
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className={lbl}>Report Name</label><input type="text" placeholder="e.g. CBC Report March" value={form.reportName} onChange={e => setForm(f => ({ ...f, reportName: e.target.value }))} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Report Type</label>
                            <select value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))} className={inp}>
                                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>Notes (optional)</label><input type="text" placeholder="Brief note" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inp} /></div>
                    </div>
                    <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        {uploading ? 'Uploading...' : 'Upload Report'}
                    </button>
                </form>
            </div>

            {/* Reports List */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-extrabold text-white mb-5 flex items-center gap-2"><FileText size={18} className="text-blue-400" /> My Reports</h3>
                {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>
                    : reports.length === 0 ? <p className="text-gray-500 text-center py-8">No reports uploaded yet.</p>
                        : (
                            <div className="space-y-3">
                                {reports.map(r => (
                                    <motion.div key={r._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                        <div className="bg-blue-500/20 border border-blue-500/30 p-2.5 rounded-xl shrink-0"><FileText size={18} className="text-blue-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate">{r.reportName}</p>
                                            <p className="text-xs text-gray-500">{r.reportType} · {new Date(r.uploadDate).toLocaleDateString('en-IN')}</p>
                                            {r.notes && <p className="text-xs text-gray-600 mt-0.5">{r.notes}</p>}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <a href={r.reportUrl} target="_blank" rel="noreferrer" className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-all"><ExternalLink size={15} /></a>
                                            <button onClick={() => handleDelete(r._id)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={15} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
            </div>
        </div>
    );
};

export default ReportUpload;
