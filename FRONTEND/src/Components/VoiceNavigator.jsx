import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

const COMMANDS = [
    { phrases: ['book appointment', 'book doctor', 'make appointment', 'डॉक्टर', 'अपॉइंटमेंट', 'apointment'], action: '/doctors', label: 'Opening Doctors →' },
    { phrases: ['health report', 'my report', 'health records', 'रिपोर्ट', 'स्वास्थ्य'], action: '/health-records', label: 'Opening Health Records →' },
    { phrases: ['nearby hospital', 'find hospital', 'hospital', 'अस्पताल', 'हॉस्पिटल'], action: '/hospitals', label: 'Finding Nearby Hospitals →' },
    { phrases: ['government scheme', 'schemes', 'yojana', 'योजना', 'सरकारी योजना'], action: '/schemes', label: 'Opening Government Schemes →' },
    { phrases: ['baby dashboard', 'baby', 'बच्चा', 'बच्चे'], action: '/baby-dashboard', label: 'Opening Baby Dashboard →' },
    { phrases: ['home', 'go home', 'home page', 'होम'], action: '/', label: 'Going Home →' },
    { phrases: ['health dashboard', 'my health', 'health', 'स्वास्थ्य डैशबोर्ड'], action: '/health-dashboard', label: 'Opening Health Dashboard →' },
];

const LANG_MAP = { English: 'en-IN', Hindi: 'hi-IN', Marathi: 'mr-IN', Bengali: 'bn-IN', Bhojpuri: 'hi-IN' };

const VoiceNavigator = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [visible, setVisible] = useState(false);
    const [lang, setLang] = useState('Hindi');
    const [supported, setSupported] = useState(true);
    const recogRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    const startListening = () => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;

        const recog = new SpeechRec();
        recog.lang = LANG_MAP[lang];
        recog.interimResults = true;
        recog.maxAlternatives = 3;
        recogRef.current = recog;

        recog.onstart = () => { setIsListening(true); setStatus('Listening... speak now'); setTranscript(''); setActionMsg(''); };
        recog.onresult = (e) => {
            const t = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
            setTranscript(t);
        };
        recog.onend = () => {
            setIsListening(false);
            setStatus('Processing...');
            const spoken = transcript.toLowerCase();
            const matched = COMMANDS.find(c => c.phrases.some(p => spoken.includes(p)));
            if (matched) {
                setActionMsg(matched.label);
                setStatus('Command recognised!');
                setTimeout(() => { navigate(matched.action); setVisible(false); setStatus(''); setActionMsg(''); }, 1200);
            } else if (spoken.trim()) {
                setStatus('Command not recognised. Try again?');
            } else {
                setStatus('No speech detected.');
            }
        };
        recog.onerror = (e) => { setIsListening(false); setStatus(`Error: ${e.error}`); };
        recog.start();
    };

    const stopListening = () => { recogRef.current?.stop(); };

    // Do NOT render on home page or if browser unsupported
    if (!supported || location.pathname === '/') return null;

    return (
        <>
            {/* Floating mic button */}
            <button
                onClick={() => setVisible(v => !v)}
                className="fixed bottom-6 left-6 z-50 bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-xl shadow-sky-900/20 transition-all hover:scale-105 flex items-center justify-center border border-sky-300"
                title="Voice Navigator">
                <Mic size={22} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Panel */}
            <AnimatePresence>
                {visible && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 left-6 z-50 glass-card-elevated p-5 w-72 border border-sky-200 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-extrabold text-slate-900 flex items-center gap-2"><Volume2 size={16} className="text-sky-600" /> Voice Navigator</h4>
                            <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
                        </div>

                        {/* Language picker */}
                        <div className="flex gap-1 flex-wrap mb-4">
                            {Object.keys(LANG_MAP).map(l => (
                                <button key={l} onClick={() => setLang(l)}
                                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${lang === l ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-sky-50'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* Mic button */}
                        <button onClick={isListening ? stopListening : startListening}
                            className={`w-full py-3 rounded-2xl font-extrabold text-white transition-all flex items-center justify-center gap-2 mb-3 relative overflow-hidden ${isListening ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700'}`}>
                            {isListening && <span className="absolute inset-0 bg-rose-400/20 animate-ping rounded-2xl" />}
                            {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
                        </button>

                        {transcript && <p className="text-xs text-slate-500 mb-2 italic">"{transcript}"</p>}
                        {status && <p className={`text-xs font-bold ${actionMsg ? 'text-emerald-600' : 'text-slate-500'}`}>{actionMsg || status}</p>}

                        <div className="mt-4 pt-3 border-t border-sky-100">
                            <p className="text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Try saying:</p>
                            <p className="text-xs text-slate-600">• "Book appointment" / "डॉक्टर"</p>
                            <p className="text-xs text-slate-600">• "Find hospital" / "अस्पताल"</p>
                            <p className="text-xs text-slate-600">• "Government scheme" / "योजना"</p>
                            <p className="text-xs text-slate-600">• "Baby dashboard" / "बच्चा"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VoiceNavigator;
