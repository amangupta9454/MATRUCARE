import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import Navbar from '../Components/Navbar';
import InsuranceCard from '../Components/InsuranceCard';
import InsuranceForm from '../Components/InsuranceForm';

const InsuranceDashboard = () => {
    const [policies, setPolicies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [coverageResult, setCoverageResult] = useState(null);

    const fetchPolicies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/insurance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPolicies(res.data.policies);
        } catch (error) {
            console.error('Failed to fetch policies', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleAddPolicy = async (formData) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/insurance`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPolicies([...policies, res.data.policy]);
            setShowForm(false);
        } catch (error) {
            console.error('Failed to add policy', error);
            alert('Failed to add policy');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this policy?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/insurance/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPolicies(policies.filter(p => p._id !== id));
        } catch (error) {
            console.error('Failed to delete policy', error);
        }
    };

    const handleCheckCoverage = async (id) => {
        const hospital = prompt('Enter Hospital Name to check coverage:');
        if (!hospital) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/insurance/${id}/coverage?hospitalName=${hospital}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoverageResult({ hospital, isCovered: res.data.isCovered });
            setTimeout(() => setCoverageResult(null), 5000); // clear after 5s
        } catch (error) {
            console.error('Coverage check failed', error);
            alert('Failed to check coverage');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-sky-500/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Insurance</span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl">
                            Manage all your health insurance cards in one secure digital vault. Apply them instantly during hospital bookings.
                        </p>
                    </div>

                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={20} /> Add New Policy
                        </button>
                    )}
                </div>

                {coverageResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${coverageResult.isCovered ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/10 border-rose-500/50 text-rose-300'}`}
                    >
                        {coverageResult.isCovered ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                        <div>
                            <p className="font-semibold text-lg">{coverageResult.isCovered ? 'Coverage Verified!' : 'Not in Network'}</p>
                            <p className="text-sm opacity-80">
                                {coverageResult.isCovered
                                    ? `${coverageResult.hospital} is covered under this policy.`
                                    : `${coverageResult.hospital} is NOT listed in this policy's network. You may need to pay out of pocket.`}
                            </p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className={showForm ? 'lg:col-span-7' : 'lg:col-span-12'}>
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" /></div>
                        ) : policies.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                                <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-400">
                                    <ShieldAlert size={32} />
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">No Policies Found</h3>
                                <p className="text-gray-400 mb-6">You haven't added any health insurance policies yet.</p>
                                {!showForm && (
                                    <button onClick={() => setShowForm(true)} className="text-sky-400 font-medium hover:text-sky-300 transition-colors">
                                        Click here to add one
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${showForm ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                <AnimatePresence>
                                    {policies.map(policy => (
                                        <InsuranceCard
                                            key={policy._id}
                                            policy={policy}
                                            onDelete={handleDelete}
                                            onCheckCoverage={handleCheckCoverage}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Add Policy Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="lg:col-span-5"
                            >
                                <div className="sticky top-24">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">New Policy</h2>
                                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                                    </div>
                                    <InsuranceForm onSubmit={handleAddPolicy} isLoading={submitting} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default InsuranceDashboard;
