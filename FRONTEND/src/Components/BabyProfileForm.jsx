import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Baby, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const BabyProfileForm = ({ onSaved }) => {
    const { token } = useContext(AuthContext);
    const [form, setForm] = useState({ babyName: '', gender: 'Female', birthDate: '', birthWeight: '', birthHeight: '', bloodGroup: '', deliveryHospital: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [existing, setExisting] = useState(null);
    const [loading, setLoading] = useState(true);

    const authHeader = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/baby`, { headers: authHeader })
            .then(r => { setExisting(r.data); setForm({ ...r.data, birthDate: r.data.birthDate?.split('T')[0] || '' }); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('');
        try {
            const method = existing ? axios.put : axios.post;
            const r = await method(`${import.meta.env.VITE_API_URL}/baby`, form, { headers: authHeader });
            setExisting(r.data);
            setSuccess(existing ? 'Baby profile updated!' : 'Baby profile created! Vaccination schedule scaffolded automatically.');
            if (onSaved) onSaved(r.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving baby profile');
        } finally { setSaving(false); }
    };

    const genders = ['Female', 'Male', 'Other'];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500/20 border border-pink-500/30 p-2.5 rounded-xl"><Baby size={20} className="text-pink-400" /></div>
                <div>
                    <h3 className="font-extrabold text-white text-xl">{existing ? 'Update Baby Profile' : 'Create Baby Profile'}</h3>
                    <p className="text-xs text-gray-500">{existing ? 'Edit your baby\'s details' : 'Post-delivery baby registration — vaccination schedule will be created automatically'}</p>
                </div>
            </div>

            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className={lbl}>Baby's Name *</label><input name="babyName" required placeholder="e.g. Aarav" value={form.babyName} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Gender *</label>
                        <select name="gender" required value={form.gender} onChange={handleChange} className={inp}>
                            {genders.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5"><label className={lbl}>Date of Birth *</label><input type="date" name="birthDate" required value={form.birthDate} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Blood Group</label>
                        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inp}>
                            <option value="">Select...</option>
                            {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5"><label className={lbl}>Birth Weight (kg)</label><input type="number" name="birthWeight" step="0.01" placeholder="e.g. 3.2" value={form.birthWeight} onChange={handleChange} className={inp} /></div>
                    <div className="space-y-1.5"><label className={lbl}>Birth Height (cm)</label><input type="number" name="birthHeight" step="0.1" placeholder="e.g. 49.5" value={form.birthHeight} onChange={handleChange} className={inp} /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className={lbl}>Delivery Hospital</label><input name="deliveryHospital" placeholder="Hospital name" value={form.deliveryHospital} onChange={handleChange} className={inp} /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className={lbl}>Notes</label><textarea name="notes" rows="2" placeholder="Any special notes..." value={form.notes} onChange={handleChange} className={`${inp} resize-none`} /></div>
                </div>

                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : existing ? 'Update Profile' : 'Create Profile'}
                </button>
            </form>
        </motion.div>
    );
};

export default BabyProfileForm;
