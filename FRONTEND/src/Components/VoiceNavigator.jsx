import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
            // Match command
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

    if (!supported) return null; // Browser doesn't support — hide silently

    return (
        <>
            {/* Floating mic button */}
            <button
                onClick={() => setVisible(v => !v)}
                className="fixed bottom-6 left-6 z-50 bg-teal-600 hover:bg-teal-500 text-white p-4 rounded-full shadow-xl shadow-teal-900/50 transition-all hover:scale-105 flex items-center justify-center"
                title="Voice Navigator">
                <Mic size={22} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#060d14] animate-pulse" />
            </button>

            {/* Panel */}
            <AnimatePresence>
                {visible && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 left-6 z-50 glass-card p-5 w-72 border border-teal-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-extrabold text-white flex items-center gap-2"><Volume2 size={16} className="text-teal-400" /> Voice Navigator</h4>
                            <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                        </div>

                        {/* Language picker */}
                        <div className="flex gap-1 flex-wrap mb-4">
                            {Object.keys(LANG_MAP).map(l => (
                                <button key={l} onClick={() => setLang(l)}
                                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${lang === l ? 'bg-teal-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* Mic button */}
                        <button onClick={isListening ? stopListening : startListening}
                            className={`w-full py-3 rounded-2xl font-extrabold text-white transition-all flex items-center justify-center gap-2 mb-3 relative overflow-hidden ${isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-teal-600 hover:bg-teal-500'}`}>
                            {isListening && <span className="absolute inset-0 bg-red-400/20 animate-ping rounded-2xl" />}
                            {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
                        </button>

                        {transcript && <p className="text-xs text-gray-400 mb-2 italic">"{transcript}"</p>}
                        {status && <p className={`text-xs font-bold ${actionMsg ? 'text-green-400' : 'text-gray-500'}`}>{actionMsg || status}</p>}

                        <div className="mt-4 pt-3 border-t border-white/10">
                            <p className="text-xs text-gray-600 font-bold mb-1.5 uppercase tracking-wider">Try saying:</p>
                            <p className="text-xs text-gray-500">• "Book appointment" / "डॉक्टर"</p>
                            <p className="text-xs text-gray-500">• "Find hospital" / "अस्पताल"</p>
                            <p className="text-xs text-gray-500">• "Government scheme" / "योजना"</p>
                            <p className="text-xs text-gray-500">• "Baby dashboard" / "बच्चा"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VoiceNavigator;
