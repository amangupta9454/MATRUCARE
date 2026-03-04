import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Loader2, CheckCircle2, MapPin, AlertCircle, Ambulance } from 'lucide-react';

const EmergencyRequestButton = ({ compact = false }) => {
    const { token } = useContext(AuthContext);
    const [state, setState] = useState('idle'); // idle | locating | sending | sent | error
    const [errorMsg, setErrorMsg] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [recipients, setRecipients] = useState([]);

    const sendAlert = async (lat, lon) => {
        setState('sending');
        try {
            const r = await axios.post(`${import.meta.env.VITE_API_URL}/health/emergency`,
                { latitude: lat, longitude: lon, message: customMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecipients(r.data.recipients || []);
            setState('sent');
            setTimeout(() => { setState('idle'); setShowConfirm(false); setCustomMessage(''); setRecipients([]); }, 8000);
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
                () => sendAlert(null, null)
            );
        } else { sendAlert(null, null); }
    };

    if (state === 'sent') return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card border-green-500/30 p-5">
            <div className="flex items-center gap-3 text-green-400 mb-3">
                <CheckCircle2 size={22} /><span className="font-extrabold text-lg">Emergency Alert Sent!</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Alerts dispatched to {recipients.length} contact(s):</p>
            <div className="flex flex-wrap gap-2">
                {recipients.map(r => <span key={r} className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-lg">{r}</span>)}
            </div>
        </motion.div>
    );

    return (
        <div className="glass-card border-red-500/20 p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 border border-red-500/30 p-2.5 rounded-xl"><Siren size={20} className="text-red-400" /></div>
                <div>
                    <h3 className={`font-extrabold text-white ${compact ? 'text-base' : 'text-lg'}`}>Emergency Ambulance</h3>
                    <p className="text-xs text-gray-500">Alerts doctor, ASHA worker & emergency contact</p>
                </div>
            </div>

            {state === 'error' && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={15} />{errorMsg}
                    <button onClick={() => setState('idle')} className="ml-auto underline text-xs">Retry</button>
                </div>
            )}

            {!showConfirm ? (
                <div className="space-y-3">
                    {!compact && (
                        <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows="2"
                            placeholder="Describe the emergency briefly (optional)..."
                            className="dark-input resize-none text-sm" />
                    )}
                    <button onClick={() => setShowConfirm(true)}
                        className="w-full py-4 rounded-2xl font-extrabold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 relative overflow-hidden">
                        <span className="absolute inset-0 bg-red-500/20 animate-ping rounded-2xl" />
                        <Siren size={20} /> SEND EMERGENCY ALERT
                    </button>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                            <p className="font-bold mb-1">⚠️ Confirm Emergency Alert</p>
                            <p>This will immediately alert your doctor, ASHA worker, and emergency contact with your GPS location.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowConfirm(false)} disabled={['locating', 'sending'].includes(state)}
                                className="flex-1 py-3 rounded-xl text-gray-400 hover:bg-white/10 transition-colors font-bold">Cancel</button>
                            <button onClick={handleEmergency} disabled={['locating', 'sending'].includes(state)}
                                className="flex-1 py-3 rounded-xl font-extrabold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                {state === 'locating' ? <><MapPin size={15} className="animate-bounce" /> Getting Location...</>
                                    : state === 'sending' ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                                        : <><Ambulance size={16} /> Confirm</>}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default EmergencyRequestButton;
