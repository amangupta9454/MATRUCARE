import React from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, CheckCircle2, XCircle, RefreshCw, ExternalLink, Hash, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS = {
    Pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock, dot: 'bg-yellow-400' },
    Accepted: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2, dot: 'bg-green-400' },
    Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle, dot: 'bg-red-400' },
    Rescheduled: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: RefreshCw, dot: 'bg-blue-400' },
    Completed: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: CheckCircle2, dot: 'bg-gray-400' },
};

/**
 * TeleConsultCard — reusable card for one tele-consultation record.
 * Props:
 *   consult   — TeleConsult document (populated)
 *   viewAs    — 'Mother' | 'Doctor'
 *   onAccept  — (consultId) => void   (Doctor only)
 *   onReject  — (consult) => void     (Doctor only)
 *   onComplete — (consultId) => void  (Doctor only)
 */
const TeleConsultCard = ({ consult: c, viewAs, onAccept, onReject, onComplete, index = 0 }) => {
    const navigate = useNavigate();
    const theme = STATUS[c.status] || STATUS.Pending;
    const Icon = theme.icon;

    const otherParty = viewAs === 'Mother'
        ? { name: `Dr. ${c.doctor?.user?.name}`, photo: c.doctor?.user?.profileImage?.url }
        : { name: c.mother?.name, photo: c.mother?.profileImage?.url };

    const avatarSeed = otherParty.name || 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card border ${theme.border} overflow-hidden`}
        >
            {/* Top row */}
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                {/* Left: avatar + info */}
                <div className="flex items-start gap-3">
                    <img
                        src={otherParty.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`}
                        alt={otherParty.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
                    />
                    <div>
                        <p className="font-extrabold text-white">{otherParty.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                            {c.appointmentId && (
                                <span className="flex items-center gap-1 font-mono text-teal-400">
                                    <Hash size={10} />{c.appointmentId}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock size={10} /> {new Date(c.preferredTime).toLocaleString('en-IN')}
                            </span>
                            {c.newTime && (
                                <span className="flex items-center gap-1 text-blue-400">
                                    <RefreshCw size={10} /> {new Date(c.newTime).toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        {c.doctorNote && (
                            <p className="text-xs text-indigo-300 mt-1.5 italic">
                                "{c.doctorNote}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${theme.bg} ${theme.border} ${theme.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                        <Icon size={10} /> {c.status}
                    </span>

                    {/* Join Meeting — for both roles when Accepted */}
                    {c.status === 'Accepted' && (
                        <button
                            onClick={() => navigate(`/teleconsult/room/${c._id}`)}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                            <Video size={12} /> Join Meeting
                        </button>
                    )}

                    {/* Doctor actions for Pending */}
                    {viewAs === 'Doctor' && c.status === 'Pending' && (
                        <div className="flex gap-1.5">
                            <button onClick={() => onAccept?.(c._id)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
                                <CheckCircle2 size={11} /> Accept
                            </button>
                            <button onClick={() => onReject?.(c)}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
                                <XCircle size={11} /> Reject
                            </button>
                        </div>
                    )}

                    {/* Doctor: mark complete */}
                    {viewAs === 'Doctor' && c.status === 'Accepted' && (
                        <button onClick={() => onComplete?.(c._id)}
                            className="text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1 rounded-lg transition-all">
                            Mark Complete
                        </button>
                    )}
                </div>
            </div>

            {/* Join banner */}
            {c.status === 'Accepted' && c.meetingRoom && (
                <div className="border-t border-green-500/20 bg-green-500/5 px-5 py-2.5 flex items-center justify-between gap-3">
                    <p className="text-xs text-green-400 font-mono flex items-center gap-1.5">
                        <Video size={11} /> meet.jit.si/{c.meetingRoom}
                    </p>
                    <a href={`https://meet.jit.si/${c.meetingRoom}`} target="_blank" rel="noreferrer"
                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                        <ExternalLink size={11} /> Open in Jitsi
                    </a>
                </div>
            )}
        </motion.div>
    );
};

export default TeleConsultCard;
