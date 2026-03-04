import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Video, AlertCircle, Loader2, ArrowLeft, Mic, MicOff, Camera, CameraOff, Monitor, Phone } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * TeleConsultRoom — full-page Jitsi Meet room.
 * Route: /teleconsult/room/:consultId
 *
 * 1. Hits backend /api/teleconsult/join/:consultId to verify access
 * 2. Loads Jitsi IFrame API via <script> tag (no SDK dependency issues)
 * 3. Shows overlay controls
 */
const TeleConsultRoom = () => {
    const { consultId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    const [roomInfo, setRoomInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);

    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    const authHeader = { Authorization: `Bearer ${token}` };

    // ── Step 1: Verify access ───────────────────────────────────────────
    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/teleconsult/join/${consultId}`,
                    { headers: authHeader }
                );
                setRoomInfo(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not verify room access');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [consultId, token]);

    // ── Step 2: Load Jitsi IFrame API & join ───────────────────────────
    useEffect(() => {
        if (!roomInfo || !jitsiContainerRef.current) return;

        const loadJitsi = () => {
            if (!window.JitsiMeetExternalAPI) {
                setError('Jitsi failed to load. Please check your internet connection.');
                return;
            }

            const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
                roomName: roomInfo.meetingRoom,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: { displayName: user?.name || 'MaaCare User', email: user?.email || '' },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    disableDeepLinking: true,
                    prejoinPageEnabled: false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    TOOLBAR_BUTTONS: ['microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen', 'fodeviceselection', 'hangup', 'chat', 'raisehand', 'videoquality', 'tileview'],
                },
            });

            api.addEventListener('videoConferenceLeft', () => {
                navigate(-1);
            });

            jitsiApiRef.current = api;
            setJoined(true);
        };

        // Inject Jitsi script if not already loaded
        if (window.JitsiMeetExternalAPI) {
            loadJitsi();
        } else {
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = loadJitsi;
            script.onerror = () => setError('Could not load Jitsi Meet. Check your internet connection.');
            document.head.appendChild(script);
        }

        return () => {
            jitsiApiRef.current?.dispose();
        };
    }, [roomInfo]);

    // ── Render ──────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
            <p className="text-gray-400 text-sm">Verifying meeting access…</p>
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto mt-20 text-center">
            <div className="glass-card p-10 border border-red-500/30">
                <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-extrabold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400 text-sm mb-6">{error}</p>
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] bg-[#060d14] flex flex-col" style={{ top: 0 }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/10 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                        <ArrowLeft size={16} /> Leave
                    </button>
                    <div className="w-px h-5 bg-white/10" />
                    <Video size={16} className="text-green-400" />
                    <span className="text-sm font-bold text-white">MaaCare Tele-Consultation</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {roomInfo?.appointmentId && (
                        <span className="font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg">
                            #{roomInfo.appointmentId}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>
            </div>

            {/* Jitsi container */}
            <div ref={jitsiContainerRef} className="flex-1 w-full bg-black" />

            {/* Loading overlay */}
            {!joined && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#060d14] z-20">
                    <div className="text-center">
                        <Loader2 size={32} className="animate-spin text-green-500 mx-auto mb-3" />
                        <p className="text-white font-bold">Connecting to meeting room…</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{roomInfo?.meetingRoom}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeleConsultRoom;
