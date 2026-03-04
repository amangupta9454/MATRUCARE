import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Loader2, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

const EmergencyButton = () => {
    const { token } = useContext(AuthContext);
    const [state, setState] = useState('idle'); // idle | locating | sending | sent | error
    const [errorMsg, setErrorMsg] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const sendAlert = async (lat, lon) => {
        setState('sending');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/health/emergency`,
                { latitude: lat, longitude: lon, message: customMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setState('sent');
            setTimeout(() => { setState('idle'); setShowConfirm(false); setCustomMessage(''); }, 6000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to send alert');
            setState('error');
        }
    };

    const handleEmergency = () => {
        setState('locating');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => sendAlert(pos.coords.latitude, pos.coords.longitude),
                () => sendAlert(null, null) // Send without location
            );
        } else {
            sendAlert(null, null);
        }
    };

    return (
        <div className="glass-card border-red-500/20 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl">
                    <Siren size={22} className="text-red-400" />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-white">Emergency SOS</h3>
                    <p className="text-xs text-gray-500">Instantly alerts your doctor and emergency contact</p>
                </div>
            </div>

            {state === 'sent' ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                    <CheckCircle2 size={22} /> <span className="font-bold">Emergency alert sent! Help is on the way.</span>
                </motion.div>
            ) : state === 'error' ? (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    <AlertCircle size={18} /><span className="text-sm">{errorMsg}</span>
                    <button onClick={() => setState('idle')} className="ml-auto text-xs underline">Retry</button>
                </div>
            ) : !showConfirm ? (
                <div className="space-y-3">
                    <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)}
                        placeholder="Optional: briefly describe your emergency..." rows="2"
                        className="dark-input resize-none" />
                    <button onClick={() => setShowConfirm(true)}
                        className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-red-600 hover:bg-red-500 transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-3 relative overflow-hidden group">
                        <span className="absolute inset-0 bg-red-500/20 animate-ping rounded-2xl" />
                        <Siren size={22} /> SEND EMERGENCY ALERT
                    </button>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                            <p className="font-bold mb-1">⚠️ Confirm Emergency Alert</p>
                            <p>This will immediately notify your assigned doctor and emergency contact with your location.</p>
                            {customMessage && <p className="mt-2 italic">"{customMessage}"</p>}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} disabled={state !== 'idle'}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleEmergency} disabled={['locating', 'sending'].includes(state)}
                                className="flex-1 py-3 rounded-xl font-extrabold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                {state === 'locating' ? <><MapPin size={16} className="animate-bounce" /> Getting Location...</>
                                    : state === 'sending' ? <><Loader2 size={16} className="animate-spin" /> Sending Alert...</>
                                        : <><Siren size={16} /> Confirm Send</>}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default EmergencyButton;
