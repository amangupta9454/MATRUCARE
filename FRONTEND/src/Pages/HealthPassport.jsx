import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Fingerprint, Save, Activity, Heart, Syringe, User } from 'lucide-react';
import Navbar from '../Components/Navbar';
import HealthPassportQR from '../Components/HealthPassportQR';

const HealthPassport = () => {
    const [passport, setPassport] = useState(null);
    const [formData, setFormData] = useState({
        bloodGroup: 'Unknown',
        allergies: '',
        conditions: '',
        primaryDoctorName: '',
        primaryDoctorContact: '',
        insuranceProvider: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [qrValue, setQrValue] = useState('');

    const fetchPassport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/health-passport`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const p = res.data.passport;
            setPassport(p);

            // Set QR value to a link pointing to the user's ID
            if (p) {
                setQrValue(`https://maacare.live/passport/${p.userId._id}`);
            }

            setFormData({
                bloodGroup: p?.bloodGroup || 'Unknown',
                allergies: p?.allergies?.join(', ') || '',
                conditions: p?.conditions?.join(', ') || '',
                primaryDoctorName: p?.primaryDoctor?.name || '',
                primaryDoctorContact: p?.primaryDoctor?.contact || '',
                insuranceProvider: p?.insuranceProvider || ''
            });

        } catch (error) {
            console.error('Error fetching passport', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassport();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
                conditions: formData.conditions.split(',').map(s => s.trim()).filter(Boolean),
                primaryDoctor: {
                    name: formData.primaryDoctorName,
                    contact: formData.primaryDoctorContact
                },
                insuranceProvider: formData.insuranceProvider
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/health-passport`, dataToSubmit, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPassport(res.data.passport);
            if (res.data.passport.userId) {
                setQrValue(`https://maacare.live/passport/${res.data.passport.userId}`);
            }
            alert('Passport updated successfully!');
        } catch (error) {
            console.error('Update failed', error);
            alert('Failed to update passport');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-sky-500/20 text-sky-400 rounded-2xl mb-4">
                        <Fingerprint size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Digital Health Passport
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Your portable medical identity. Share this QR code during emergencies or check-ins to provide instant access to your vital health records.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* QR Code section */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 rounded-3xl border border-white/10 shadow-2xl w-full flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-bl-full blur-3xl" />

                            <h3 className="text-lg font-semibold text-white mb-6 tracking-wide uppercase">Scan for Medical ID</h3>

                            {loading ? (
                                <div className="w-[200px] h-[200px] flex items-center justify-center bg-white/5 rounded-xl border-4 border-slate-800"><div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" /></div>
                            ) : (
                                <HealthPassportQR qrValue={qrValue} />
                            )}

                            <div className="mt-8 pt-6 border-t border-white/10 w-full space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">ID Status:</span>
                                    {passport ? <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 size={14} /> Active</span> : <span className="text-rose-400 font-semibold">Incomplete</span>}
                                </div>
                                <p className="text-xs text-slate-500 italic">This code is cryptographically linked to your registered MaaCare profile.</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Activity className="text-sky-400" /> Vital Information
                        </h2>

                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" /></div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Heart size={16} className="text-rose-400" /> Blood Group</label>
                                        <select
                                            name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:outline-none transition-colors"
                                        >
                                            {['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Syringe size={16} className="text-amber-400" /> Allergies (comma separated)</label>
                                        <input
                                            name="allergies" value={formData.allergies} onChange={handleChange}
                                            placeholder="E.g., Penicillin, Peanuts"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:outline-none transition-colors placeholder-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Activity size={16} className="text-emerald-400" /> Underlying Conditions</label>
                                        <input
                                            name="conditions" value={formData.conditions} onChange={handleChange}
                                            placeholder="E.g., Asthma, Hypertension, Diabetes Type 2"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-sky-500 focus:outline-none transition-colors placeholder-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User size={18} className="text-indigo-400" /> Primary Contacts & Insurance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Primary Doctor Name</label>
                                            <input
                                                name="primaryDoctorName" value={formData.primaryDoctorName} onChange={handleChange}
                                                placeholder="Dr. Smith"
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Primary Doctor Contact</label>
                                            <input
                                                name="primaryDoctorContact" value={formData.primaryDoctorContact} onChange={handleChange}
                                                placeholder="+91..."
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-400">Insurance Provider Setup</label>
                                            <input
                                                name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange}
                                                placeholder="Which provider represents your primary coverage?"
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={saving}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? 'Updating...' : <><Save size={20} /> Update Passport Data</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthPassport;
