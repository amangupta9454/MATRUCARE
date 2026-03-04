import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Search, Play, X, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';

// ── Indian language config ────────────────────────────────────────────────────
const LANGUAGES = [
    { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
    { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
    { code: 'te', label: 'తెలుగు', name: 'Telugu' },
    { code: 'bn', label: 'বাংলা', name: 'Bengali' },
    { code: 'mr', label: 'मराठी', name: 'Marathi' },
    { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
    { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
    { code: 'en', label: 'English', name: 'English' },
];

// Language-specific topic translations for more relevant results
const TOPIC_TRANSLATIONS = {
    hi: [
        { id: 'exercise', label: '🧘 प्रसवपूर्व व्यायाम', query: 'गर्भावस्था व्यायाम योगा प्रेगनेंसी' },
        { id: 'nutrition', label: '🥗 खानपान', query: 'गर्भावस्था में खानपान सही आहार' },
        { id: 'sleep', label: '😴 नींद', query: 'प्रेगनेंसी में सोने का तरीका' },
        { id: 'baby_dev', label: '👶 शिशु विकास', query: 'गर्भ में शिशु का विकास सप्ताह' },
        { id: 'breathing', label: '💨 प्रसव तैयारी', query: 'प्रसव के लिए सांस लेने का अभ्यास' },
        { id: 'mental', label: '🧠 मानसिक स्वास्थ्य', query: 'गर्भावस्था में तनाव कम करें' },
        { id: 'tips', label: '💡 सुझाव', query: 'गर्भावस्था टिप्स हिंदी' },
        { id: 'breastfeed', label: '🤱 स्तनपान', query: 'स्तनपान कैसे करें नई माँ' },
        { id: 'newborn', label: '🍼 नवजात देखभाल', query: 'नवजात शिशु की देखभाल हिंदी' },
    ],
    ta: [
        { id: 'exercise', label: '🧘 தாய்மை உடற்பயிற்சி', query: 'pregnant women exercise Tamil' },
        { id: 'nutrition', label: '🥗 சரியான உணவு', query: 'pregnancy diet Tamil food' },
        { id: 'sleep', label: '😴 தூக்கம்', query: 'pregnancy sleep Tamil tips' },
        { id: 'baby_dev', label: '👶 குழந்தை வளர்ச்சி', query: 'baby development Tamil' },
        { id: 'breathing', label: '💨 மூச்சுப்பயிற்சி', query: 'labour breathing exercise Tamil' },
        { id: 'mental', label: '🧠 மன ஆரோக்கியம்', query: 'pregnancy mental health Tamil' },
        { id: 'tips', label: '💡 குறிப்புகள்', query: 'pregnancy tips Tamil' },
        { id: 'breastfeed', label: '🤱 தாய்ப்பால்', query: 'breastfeeding Tamil' },
        { id: 'newborn', label: '🍼 புதுப்பிறந்த குழந்தை', query: 'newborn care Tamil' },
    ],
    en: [
        { id: 'exercise', label: '🧘 Prenatal Exercise', query: 'prenatal yoga exercise Indian pregnant women' },
        { id: 'nutrition', label: '🥗 Indian Diet', query: 'Indian pregnancy diet nutrition healthy food' },
        { id: 'sleep', label: '😴 Sleep & Rest', query: 'pregnancy sleep tips India' },
        { id: 'baby_dev', label: '👶 Baby Development', query: 'baby development stages pregnancy week by week India' },
        { id: 'breathing', label: '💨 Labour Prep', query: 'labour breathing exercises Indian mothers' },
        { id: 'mental', label: '🧠 Mental Wellness', query: 'mental health anxiety during pregnancy India' },
        { id: 'tips', label: '💡 Pregnancy Tips', query: 'pregnancy tips advice Indian mothers' },
        { id: 'breastfeed', label: '🤱 Breastfeeding', query: 'breastfeeding tips Indian newborn' },
        { id: 'newborn', label: '🍼 Baby Care', query: 'newborn care tips India' },
    ],
};

// For other Indian languages, fall back to English + language name enrichment
const getTopics = (langCode) =>
    TOPIC_TRANSLATIONS[langCode] ||
    TOPIC_TRANSLATIONS['en'].map(t => ({ ...t, query: `${t.query} ${LANGUAGES.find(l => l.code === langCode)?.name || ''}` }));

const buildQuery = (topicQuery, pregnancyWeek) => {
    if (!pregnancyWeek) return topicQuery;
    if (pregnancyWeek <= 12) return `first trimester ${topicQuery}`;
    if (pregnancyWeek <= 26) return `second trimester ${topicQuery}`;
    return `third trimester ${topicQuery}`;
};

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const PregnancyVideos = () => {
    const { token } = useContext(AuthContext);
    const [lang, setLang] = useState('hi');
    const [activeTopic, setActiveTopic] = useState(null);           // initialised after lang set
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [playing, setPlaying] = useState(null);
    const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('maacare_saved_videos') || '[]'));
    const [pregnancyWeek, setPregnancyWeek] = useState(null);
    const [customQuery, setCustomQuery] = useState('');
    const [searchMode, setSearchMode] = useState(false);

    const topics = getTopics(lang);

    // Set default topic when language changes
    useEffect(() => {
        setActiveTopic(topics[0]);
        setSearchMode(false);
        setCustomQuery('');
    }, [lang]);

    // Fetch pregnancy week for context
    useEffect(() => {
        if (!token) return;
        axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setPregnancyWeek(r.data?.pregnancyWeek)).catch(() => { });
    }, [token]);

    // Fetch videos whenever topic or lang changes
    useEffect(() => {
        if (!activeTopic || searchMode) return;
        fetchVideos(buildQuery(activeTopic.query, pregnancyWeek), lang);
    }, [activeTopic, lang, pregnancyWeek]);

    const fetchVideos = async (q, langCode) => {
        setLoading(true); setError(''); setVideos([]);
        const langObj = LANGUAGES.find(l => l.code === langCode);
        try {
            const res = await axios.get(YOUTUBE_API, {
                params: {
                    key: KEY,
                    q,
                    part: 'snippet',
                    type: 'video',
                    maxResults: 9,
                    videoEmbeddable: true,
                    safeSearch: 'strict',
                    relevanceLanguage: langCode,   // filter to that language
                    regionCode: 'IN',              // India only
                },
            });
            setVideos(res.data.items || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Could not load videos. Please check API key or quota.');
        } finally { setLoading(false); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!customQuery.trim()) return;
        setSearchMode(true);
        fetchVideos(`${customQuery} pregnancy`, lang);
    };

    const toggleSave = (video) => {
        const already = saved.find(v => v.id.videoId === video.id.videoId);
        const next = already ? saved.filter(v => v.id.videoId !== video.id.videoId) : [...saved, video];
        setSaved(next);
        localStorage.setItem('maacare_saved_videos', JSON.stringify(next));
    };

    const isSaved = (videoId) => saved.some(v => v.id.videoId === videoId);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Youtube size={22} className="text-red-500" /> Pregnancy Videos
                    </h3>
                    {pregnancyWeek && (
                        <p className="text-xs text-gray-500 mt-0.5">Personalised for <strong className="text-teal-400">Week {pregnancyWeek}</strong> · India 🇮🇳</p>
                    )}
                </div>
                {/* Custom search */}
                <form onSubmit={handleSearch} className="flex gap-2 min-w-[260px]">
                    <input value={customQuery} onChange={e => setCustomQuery(e.target.value)}
                        placeholder="Search any topic..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                    <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2.5 rounded-xl transition-all">
                        <Search size={16} />
                    </button>
                </form>
            </div>

            {/* ── Language selector ─────────────────────────────────── */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">भाषा / Language</p>
                <div className="flex gap-2 flex-wrap">
                    {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => setLang(l.code)}
                            className={`text-sm font-bold px-3.5 py-1.5 rounded-xl border transition-all ${lang === l.code ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Topic pills ───────────────────────────────────────── */}
            <div className="flex gap-2 flex-wrap">
                {topics.map(t => (
                    <button key={t.id}
                        onClick={() => { setActiveTopic(t); setSearchMode(false); setCustomQuery(''); }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all border ${activeTopic?.id === t.id && !searchMode ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                        {t.label}
                    </button>
                ))}
                {saved.length > 0 && (
                    <button onClick={() => { setVideos(saved); setLoading(false); setSearchMode(true); setCustomQuery(''); setError(''); }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all flex items-center gap-1">
                        <BookmarkCheck size={12} /> Saved ({saved.length})
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="glass-card p-4 border border-red-500/30 text-red-400 text-sm">⚠️ {error}</div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-teal-500" />
                    <span className="text-gray-500 text-sm">Loading videos…</span>
                </div>
            )}

            {/* Video grid */}
            {!loading && videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((v, i) => {
                        const { videoId } = v.id;
                        const { title, channelTitle, thumbnails } = v.snippet;
                        return (
                            <motion.div key={videoId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-card overflow-hidden group hover:border-red-500/30 border border-white/10 transition-all">
                                <div className="relative cursor-pointer" onClick={() => setPlaying(videoId)}>
                                    <img src={thumbnails?.medium?.url} alt={title} className="w-full aspect-video object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-red-600 rounded-full p-4 shadow-xl">
                                            <Play size={24} fill="white" className="text-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-bold text-white mb-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {title}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">{channelTitle}</p>
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => setPlaying(videoId)} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 font-bold">
                                            <Play size={11} fill="currentColor" /> Watch
                                        </button>
                                        <button onClick={() => toggleSave(v)} className={`text-xs flex items-center gap-1 font-bold transition-colors ${isSaved(videoId) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}>
                                            {isSaved(videoId) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                                            {isSaved(videoId) ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!loading && !error && videos.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Youtube className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                    <p className="text-white font-bold">No videos found</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different topic or language.</p>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {playing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setPlaying(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setPlaying(null)} className="absolute -top-10 right-0 text-white hover:text-red-400 flex items-center gap-1 text-sm font-bold">
                                <X size={18} /> Close
                            </button>
                            <iframe
                                src={`https://www.youtube.com/embed/${playing}?autoplay=1&rel=0&modestbranding=1`}
                                className="w-full h-full rounded-2xl border border-white/10"
                                allow="autoplay; encrypted-media" allowFullScreen title="Pregnancy video" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PregnancyVideos;
