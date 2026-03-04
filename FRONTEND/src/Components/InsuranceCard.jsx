import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Building2, Calendar } from 'lucide-react';

const InsuranceCard = ({ policy, onDelete, onCheckCoverage }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl overflow-hidden relative group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-bl-full z-0 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">{policy.providerName}</h3>
                            <p className="text-gray-400 text-sm font-mono tracking-wider">{policy.policyNumber}</p>
                        </div>
                    </div>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(policy._id)}
                            className="text-red-400 hover:text-red-300 transition-colors text-sm"
                        >
                            Remove
                        </button>
                    )}
                </div>

                <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between text-gray-300">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Coverage</div>
                        <span className="font-semibold text-white">₹{policy.coverageAmount?.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-300">
                        <div className="flex items-center gap-2"><Calendar size={14} /> Validity</div>
                        <span className="text-sm">
                            {new Date(policy.validFrom).toLocaleDateString()} - {new Date(policy.validTill).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-300">
                        <div className="flex items-center gap-2"><Building2 size={14} /> Network</div>
                        <span className="text-sm truncate max-w-[150px]" title={policy.hospitalNetwork.join(', ') || 'All major hospitals'}>
                            {policy.hospitalNetwork.length > 0 ? policy.hospitalNetwork.length + ' Hospitals' : 'Widespread Coverage'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    {policy.documentUrl && (
                        <a
                            href={policy.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 text-sm"
                        >
                            <FileText size={16} /> View Document
                        </a>
                    )}
                    {onCheckCoverage && (
                        <button
                            onClick={() => onCheckCoverage(policy._id)}
                            className="flex-1 py-2 px-4 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl transition-colors font-medium text-sm"
                        >
                            Check Coverage
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default InsuranceCard;
