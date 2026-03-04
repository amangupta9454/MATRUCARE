import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ExternalLink, FileDown, Shield, XCircle } from 'lucide-react';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'J&K', 'Jharkhand', 'Karnataka', 'Kerala', 'MP', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'UP', 'UK', 'West Bengal'];
const lbl = "text-xs font-bold text-gray-400 uppercase tracking-wider";
const inp = "dark-input";

const SchemeEligibilityForm = () => {
    const { token } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [form, setForm] = useState({
        age: '', pregnancyNumber: '1', hasAadhaar: 'true', hasBankAccount: 'true', state: 'Maharashtra', isRural: 'true',
    });

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCheck = async () => {
        setLoading(true); setError(''); setResults(null);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const r = await axios.post(`${import.meta.env.VITE_API_URL}/schemes/check`, form, { headers });
            setResults(r.data);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Error checking eligibility');
        } finally { setLoading(false); }
    };

    const handlePrint = () => window.print();

    return (
        <div className="space-y-5">
            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2"><Shield size={18} className="text-green-400" /> Check Your Eligibility</h3>
                    <p className="text-sm text-gray-500 mb-6">Answer a few questions to discover government schemes available for you.</p>

                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={15} />{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5"><label className={lbl}>Your Age</label><input type="number" name="age" min="14" max="55" required placeholder="e.g. 24" value={form.age} onChange={handleChange} className={inp} /></div>
                        <div className="space-y-1.5"><label className={lbl}>Which Pregnancy?</label>
                            <select name="pregnancyNumber" value={form.pregnancyNumber} onChange={handleChange} className={inp}>
                                <option value="1">1st Pregnancy</option>
                                <option value="2">2nd Pregnancy</option>
                                <option value="3">3rd or more</option>
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>Do you have an Aadhaar Card?</label>
                            <select name="hasAadhaar" value={form.hasAadhaar} onChange={handleChange} className={inp}>
                                <option value="true">Yes</option><option value="false">No</option>
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>Do you have a Bank Account?</label>
                            <select name="hasBankAccount" value={form.hasBankAccount} onChange={handleChange} className={inp}>
                                <option value="true">Yes</option><option value="false">No</option>
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>State</label>
                            <select name="state" value={form.state} onChange={handleChange} className={inp}>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5"><label className={lbl}>Area</label>
                            <select name="isRural" value={form.isRural} onChange={handleChange} className={inp}>
                                <option value="true">Rural</option><option value="false">Urban</option>
                            </select>
                        </div>
                    </div>

                    <button onClick={handleCheck} disabled={loading || !form.age} className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                        {loading ? 'Checking...' : 'Check Eligibility'}
                    </button>
                </motion.div>
            )}

            {step === 2 && results && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-extrabold text-white">Your Eligibility Results</h3>
                            <p className="text-sm text-gray-500"><span className="text-green-400 font-bold">{results.eligibleCount}</span> of {results.results.length} schemes eligible for you</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-all"><FileDown size={13} /> PDF</button>
                            <button onClick={() => { setStep(1); setResults(null); }} className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-all">Check Again</button>
                        </div>
                    </div>

                    {token && <p className="text-xs text-teal-400 flex items-center gap-1.5"><CheckCircle2 size={13} /> Results saved to your profile and sent to your email</p>}

                    {results.results.map((scheme, i) => (
                        <div key={i} className={`glass-card border overflow-hidden ${scheme.eligible ? 'border-green-500/30' : 'border-white/10 opacity-70'}`}>
                            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                                <div className="flex items-center gap-3">
                                    {scheme.eligible
                                        ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                                        : <XCircle size={18} className="text-red-400/50 shrink-0" />}
                                    <span className={`font-bold ${scheme.eligible ? 'text-white' : 'text-gray-500'}`}>{scheme.schemeName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scheme.eligible ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400/70'}`}>
                                        {scheme.eligible ? 'Eligible' : 'Not Eligible'}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {expanded === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-white/10 px-5 pb-5 pt-4 space-y-4 overflow-hidden">
                                        <div>
                                            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">💰 Benefits</p>
                                            <ul className="space-y-1">
                                                {scheme.benefits.map((b, j) => <li key={j} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400 shrink-0">•</span>{b}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">📄 Required Documents</p>
                                            <ul className="space-y-1">
                                                {scheme.documents.map((d, j) => <li key={j} className="text-sm text-gray-300 flex gap-2"><span className="text-blue-400 shrink-0">•</span>{d}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">📋 How to Apply</p>
                                            <ol className="space-y-1 list-decimal list-inside">
                                                {scheme.steps.map((s, j) => <li key={j} className="text-sm text-gray-300">{s}</li>)}
                                            </ol>
                                        </div>
                                        <a href={scheme.officialLink} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-all">
                                            <ExternalLink size={12} /> Official Website
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default SchemeEligibilityForm;
