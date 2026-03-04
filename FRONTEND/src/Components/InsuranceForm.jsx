import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const InsuranceForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        providerName: '',
        policyNumber: '',
        coverageAmount: '',
        coverageType: 'Comprehensive',
        validFrom: '',
        validTill: '',
        hospitalNetwork: '',
        documentUrl: '' // In real-world, handle Cloudinary file upload separately
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            coverageAmount: Number(formData.coverageAmount),
            hospitalNetwork: formData.hospitalNetwork.split(',').map(h => h.trim()).filter(Boolean)
        };
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Policy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Provider Name</label>
                    <input
                        required name="providerName" value={formData.providerName} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="e.g. Star Health / HDFC Ergo"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Policy Number</label>
                    <input
                        required name="policyNumber" value={formData.policyNumber} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                        placeholder="e.g. POL-12345678"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Coverage Amount (₹)</label>
                    <input
                        required type="number" name="coverageAmount" value={formData.coverageAmount} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                        placeholder="500000"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Coverage Type</label>
                    <select
                        name="coverageType" value={formData.coverageType} onChange={handleChange}
                        className="w-full bg-black/20 text-gray-300 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 [&>option]:bg-gray-900"
                    >
                        <option value="Comprehensive">Comprehensive</option>
                        <option value="Maternity Only">Maternity Only</option>
                        <option value="Family Floater">Family Floater</option>
                        <option value="Govt Scheme">Govt Scheme (Ayushman Bharat)</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Valid From</label>
                    <input
                        required type="date" name="validFrom" value={formData.validFrom} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-sky-500"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 ml-1">Valid Till</label>
                    <input
                        required type="date" name="validTill" value={formData.validTill} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-sky-500"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-400 ml-1">Supported Hospitals (comma separated, leave blank for all)</label>
                <input
                    name="hospitalNetwork" value={formData.hospitalNetwork} onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
                    placeholder="Apollo, Fortis, Max..."
                />
            </div>

            {/* Document Upload Simulation */}
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-black/10 hover:bg-black/20 transition-colors group cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors text-white/50">
                        <UploadCloud size={28} />
                    </div>
                    <div>
                        <p className="text-gray-300 font-medium">Click to upload Insurance Document</p>
                        <p className="text-gray-500 text-sm mt-1">PDF, JPG or PNG (max 5MB)</p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {isLoading ? 'Saving...' : <><CheckCircle2 size={20} /> Save Policy</>}
            </button>
        </form>
    );
};

export default InsuranceForm;
