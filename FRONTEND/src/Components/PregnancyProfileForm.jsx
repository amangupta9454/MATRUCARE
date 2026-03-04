import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Save, Loader2, Baby, AlertCircle, CheckCircle2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const PregnancyProfileForm = ({ onSaved }) => {
    const { token } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        age: '', bloodGroup: 'O+', height: '', weight: '',
        pregnancyWeek: '', expectedDeliveryDate: '', miscarriageHistory: 'false',
        diabetes: 'false', hypertension: 'false', hemoglobin: '',
        assignedDoctor: '',
        emergencyContactName: '', emergencyContactPhone: '',
        emergencyContactEmail: '', emergencyContactRelation: '',
    });

    const bmi = form.height && form.weight
        ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
        : null;

    useEffect(() => {
        // Load existing profile
        axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            const d = r.data;
            setForm({
                age: d.age || '', bloodGroup: d.bloodGroup || 'O+',
                height: d.height || '', weight: d.weight || '',
                pregnancyWeek: d.pregnancyWeek || '',
                expectedDeliveryDate: d.expectedDeliveryDate ? d.expectedDeliveryDate.split('T')[0] : '',
                miscarriageHistory: String(d.miscarriageHistory || false),
                diabetes: String(d.diabetes || false), hypertension: String(d.hypertension || false),
                hemoglobin: d.hemoglobin || '', assignedDoctor: d.assignedDoctor?._id || '',
                emergencyContactName: d.emergencyContact?.name || '',
                emergencyContactPhone: d.emergencyContact?.phone || '',
                emergencyContactEmail: d.emergencyContact?.email || '',
                emergencyContactRelation: d.emergencyContact?.relation || '',
            });
        }).catch(() => { }); // 404 is OK for new profile

        // Load doctors list
        axios.get(`${import.meta.env.VITE_API_URL}/doctors`).then(r => setDoctors(r.data)).catch(() => { });
    }, [token]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/pregnancy/profile`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
            if (onSaved) onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
                <div className="bg-pink-500/20 border border-pink-500/30 p-3 rounded-xl"><Baby size={22} className="text-pink-400" /></div>
                <div>
                    <h2 className="text-2xl font-extrabold text-white">Pregnancy Profile</h2>
                    <p className="text-sm text-gray-500">Your health data powers personalised risk scoring and nutrition plans.</p>
                </div>
            </div>

            {saved && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2"><CheckCircle2 size={18} /> Profile saved! Risk score updated.</motion.div>}
            {error && <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2"><AlertCircle size={18} />{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-7">
                {/* Basic Health */}
                <div>
                    <p className="text-sm font-bold text-teal-400 mb-4">Basic Health Information</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5"><label className={lbl}>Age</label><input type="number" name="age" min="14" max="55" required value={form.age} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Blood Group</label>
                            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inp}>
                                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>Height (cm)</label><input type="number" name="height" min="100" max="220" required value={form.height} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Weight (kg)</label><input type="number" name="weight" min="30" max="200" required value={form.weight} onChange={handleChange} className={inp} /></div>
                    </div>
                    {bmi && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-xl">
                            <span className="text-xs text-gray-400">BMI (auto-calculated):</span>
                            <span className={`text-lg font-extrabold ${bmi < 18.5 ? 'text-yellow-400' : bmi >= 30 ? 'text-red-400' : 'text-green-400'}`}>{bmi}</span>
                            <span className="text-xs text-gray-500">{bmi < 18.5 ? 'Underweight' : bmi >= 30 ? 'Obese' : bmi >= 25 ? 'Overweight' : 'Normal'}</span>
                        </div>
                    )}
                </div>

                {/* Pregnancy Info */}
                <div>
                    <p className="text-sm font-bold text-teal-400 mb-4">Pregnancy Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><label className={lbl}>Current Week (1–42)</label><input type="number" name="pregnancyWeek" min="1" max="42" required value={form.pregnancyWeek} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Expected Delivery Date</label><input type="date" name="expectedDeliveryDate" required value={form.expectedDeliveryDate} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Hemoglobin (g/dL)</label><input type="number" name="hemoglobin" step="0.1" min="4" max="20" required value={form.hemoglobin} onChange={handleChange} className={inp} /></div>
                    </div>
                </div>

                {/* Medical History */}
                <div>
                    <p className="text-sm font-bold text-teal-400 mb-4">Medical History</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: 'miscarriageHistory', label: 'Previous Miscarriage' },
                            { name: 'diabetes', label: 'Gestational Diabetes' },
                            { name: 'hypertension', label: 'High Blood Pressure' },
                        ].map(({ name, label }) => (
                            <div key={name} className="space-y-1.5">
                                <label className={lbl}>{label}</label>
                                <select name={name} value={form[name]} onChange={handleChange} className={inp}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Doctor Assignment */}
                <div>
                    <p className="text-sm font-bold text-teal-400 mb-4">Assigned Doctor (optional)</p>
                    <select name="assignedDoctor" value={form.assignedDoctor} onChange={handleChange} className={`${inp} max-w-sm`}>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialistType}</option>)}
                    </select>
                </div>

                {/* Emergency Contact */}
                <div>
                    <p className="text-sm font-bold text-red-400 mb-4">Emergency Contact</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5"><label className={lbl}>Contact Name</label><input type="text" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Phone</label><input type="tel" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Email</label><input type="email" name="emergencyContactEmail" value={form.emergencyContactEmail} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Relation</label><input type="text" name="emergencyContactRelation" placeholder="e.g. Husband" value={form.emergencyContactRelation} onChange={handleChange} className={inp} /></div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all disabled:opacity-70">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Profile & Calculate Risk
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PregnancyProfileForm;
