import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  Clock, CheckCircle, XCircle, RefreshCw, Hash, FileText,
  Calendar as CalIcon, User, Mail, Phone, Building2,
  BriefcaseMedical, Star, Lock, AlertCircle, Video, Upload, ChevronDown, ChevronUp, Paperclip, Info, MapPin
} from 'lucide-react';
import DoctorForm from './DoctorForm';
import TeleConsultCard from './TeleConsultCard';
import { Link } from 'react-router-dom';

const statusConfig = {
  Pending: { color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  Approved: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Rejected: { color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  Cancelled: { color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  Completed: { color: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
  Rescheduled: { color: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
};

const DoctorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [activeView, setActiveView] = useState('appointments');
  const [teleConsults, setTeleConsults] = useState([]);
  const [teleAction, setTeleAction] = useState({});
  const [teleNote, setTeleNote] = useState({});
  const [teleNewTime, setTeleNewTime] = useState({});
  const [pendingAshas, setPendingAshas] = useState([]);
  const [acceptedAshas, setAcceptedAshas] = useState([]);
  const [assignableMothers, setAssignableMothers] = useState([]);
  const [assignMotherId, setAssignMotherId] = useState('');
  const [assignAshaId, setAssignAshaId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [ashaScheduleForDate, setAshaScheduleForDate] = useState([]);
  const [motherAshaHistory, setMotherAshaHistory] = useState(null);
  const [selectedAsha, setSelectedAsha] = useState(null);
  const [patientAshaSchedules, setPatientAshaSchedules] = useState([]);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Prescription upload state per appointment
  const [rxExpanded, setRxExpanded] = useState({});   // { aptId: bool }
  const [rxFile, setRxFile] = useState({});            // { aptId: File }
  const [rxNotes, setRxNotes] = useState({});          // { aptId: string }
  const [rxUploading, setRxUploading] = useState({}); // { aptId: bool }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = async () => {
    try {
      const [aptRes, profileRes, tcRes, pAshaRes, aAshaRes, mothersRes, ashaSchedulesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/appointments`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/profile`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/teleconsult/doctor`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/asha/pending`, authHeader).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/asha/accepted`, authHeader).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/asha/assignable-users`, authHeader).catch(() => ({ data: { mothers: [] } })),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/asha-schedules/all`, authHeader).catch(() => ({ data: [] })),
      ]);
      setAppointments(aptRes.data);
      setDoctorProfile(profileRes.data);
      setTeleConsults(tcRes.data || []);
      setPendingAshas(pAshaRes.data || []);
      setAcceptedAshas(aAshaRes.data || []);
      setAssignableMothers(mothersRes.data?.mothers || []);
      setPatientAshaSchedules(ashaSchedulesRes.data || []);
    } catch (err) {
      console.error('Doctor dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), { transports: ['websocket'] });
    socket.on('ashaScheduleUpdated', () => {
      // Re-fetch only the live ASHA schedules to avoid full dashboard re-render overhead if possible,
      // but fetchAll works too. Here we specifically re-fetch the ASHA schedules:
      axios.get(`${import.meta.env.VITE_API_URL}/doctors/asha-schedules/all`, authHeader)
        .then(res => setPatientAshaSchedules(res.data))
        .catch(console.error);
    });
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    if (assignAshaId && scheduleDate) {
      axios.get(`${import.meta.env.VITE_API_URL}/doctors/asha/${assignAshaId}/schedule?date=${scheduleDate}`, authHeader)
        .then(res => setAshaScheduleForDate(res.data))
        .catch(() => setAshaScheduleForDate([]));
    } else {
      setAshaScheduleForDate([]);
    }
  }, [assignAshaId, scheduleDate]);

  useEffect(() => {
    if (assignMotherId) {
      axios.get(`${import.meta.env.VITE_API_URL}/doctors/mother/${assignMotherId}/asha-history`, authHeader)
        .then(res => setMotherAshaHistory(res.data))
        .catch(() => setMotherAshaHistory(null));
    } else {
      setMotherAshaHistory(null);
    }
  }, [assignMotherId]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${id}/status`, { status: 'Approved' }, authHeader);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setActionLoading(rejectTarget._id);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${rejectTarget._id}/status`,
        { status: 'Rejected', reason: rejectReason }, authHeader);
      setRejectTarget(null); setRejectReason('');
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDate || !newTime) return;
    setActionLoading(rescheduleTarget._id);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${rescheduleTarget._id}/reschedule`,
        { newDate, newTime }, authHeader);
      setRescheduleTarget(null); setNewDate(''); setNewTime('');
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  const handleAcceptAsha = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/doctors/asha/${id}/accept`, {}, authHeader);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to accept.'); }
  };

  const handleRejectAsha = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/doctors/asha/${id}/reject`, {}, authHeader);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject.'); }
  };

  const handleAssignAsha = async () => {
    if (!assignMotherId || !assignAshaId || !scheduleDate || !scheduleTime) return alert('Select Mother, ASHA worker, date and time.');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/doctors/schedule-asha`, { 
        motherId: assignMotherId, 
        ashaId: assignAshaId,
        date: scheduleDate,
        time: scheduleTime,
        location: scheduleLocation
      }, authHeader);
      alert('Scheduled successfully!');
      setAssignMotherId('');
      setAssignAshaId('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleLocation('');
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed to schedule.'); }
  };

  const filtered = appointments.filter(a => a.status === activeTab);
  const tabCounts = {};
  ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Rescheduled'].forEach(s => {
    tabCounts[s] = appointments.filter(a => a.status === s).length;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 text-slate-800">

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card-elevated p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-rose-800 mb-1">Reject Appointment</h3>
              <p className="text-sm text-gray-500 mb-1">ID: <span className="font-mono text-teal-400">{rejectTarget.appointmentId}</span></p>
              <p className="text-sm text-gray-500 mb-4">Patient: <span className="text-slate-800 font-semibold">{rejectTarget.patientName}</span></p>
              <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)" className="dark-input resize-none mb-5" />
              <div className="flex gap-3">
                <button onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Back</button>
                <button onClick={handleReject} disabled={!rejectReason.trim() || !!actionLoading}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-70 transition-colors">
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reschedule Modal ── */}
      <AnimatePresence>
        {rescheduleTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card-elevated p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-slate-800 mb-1">Reschedule Appointment</h3>
              <p className="text-sm text-gray-500 mb-5">ID: <span className="font-mono text-teal-400">{rescheduleTarget.appointmentId}</span></p>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">New Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} className="dark-input" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">New Time</label>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="dark-input" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRescheduleTarget(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Back</button>
                <button onClick={handleReschedule} disabled={!newDate || !newTime || !!actionLoading}
                  className="flex-1 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-70 transition-colors">
                  {actionLoading ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Doctor Identity Card ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
        <img
          src={user?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
          className="w-20 h-20 rounded-2xl object-cover border border-white/10"
          alt={user?.name}
        />
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            {doctorProfile?.specialistType || 'Doctor'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-2">Dr. {user?.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Mail size={13} />{user?.email}</span>
            {doctorProfile?.mobile && <span className="flex items-center gap-1"><Phone size={13} />{doctorProfile.mobile}</span>}
            {doctorProfile?.currentOrganization && <span className="flex items-center gap-1"><Building2 size={13} />{doctorProfile.currentOrganization}</span>}
            {doctorProfile?.experienceYears > 0 && <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" />{doctorProfile.experienceYears} years exp.</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {doctorProfile?.isListed ? (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                <CheckCircle size={12} /> Listed
              </span>
              {doctorProfile?.isApproved && (
                <p className="text-xs text-teal-400 mt-1">✓ Verified by Admin</p>
              )}
              <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1 justify-end">
                <Lock size={11} /> Profile locked
              </p>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <AlertCircle size={12} /> Not Listed
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(tabCounts).map(([status, count]) => {
          const cfg = statusConfig[status] || {};
          return (
            <div key={status} className={`glass-card p-4 text-center cursor-pointer border ${activeTab === status ? cfg.color : 'border-white/10'}`}
              onClick={() => { setActiveTab(status); setActiveView('appointments'); }}>
              <p className="text-2xl font-extrabold text-slate-800">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{status}</p>
            </div>
          );
        })}
      </div>

      {/* ── View Switcher ── */}
      <div className="flex gap-2 mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit flex-wrap">
        {['appointments', 'teleconsult', 'ashas', 'profile'].map(v => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`px-6 py-2.5 rounded-xl font-bold capitalize transition-all text-sm ${activeView === v ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-white'}`}>
            {v === 'appointments' ? '📋 Appointments' : v === 'teleconsult' ? '📞 Tele-Consult' : v === 'ashas' ? '👩‍⚕️ ASHA Workers' : '👤 Profile & Listing'}
          </button>
        ))}
      </div>

      {/* ── Tele-Consult View ── */}
      {activeView === 'teleconsult' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Video size={20} className="text-indigo-600" /> Tele-Consultation Requests
            </h2>
            <Link to="/teleconsult" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors">
              Open Full Page →
            </Link>
          </div>
          {teleConsults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-14 text-center">
              <Video className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-800 font-bold">No tele-consult requests yet</p>
              <p className="text-sm text-slate-500 mt-1">Requests from patients will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teleConsults.map((c, i) => (
                <TeleConsultCard
                  key={c._id}
                  consult={c}
                  viewAs="Doctor"
                  index={i}
                  onAccept={async (id) => {
                    setTeleAction(a => ({ ...a, [id]: 'Accepting' }));
                    try {
                      await axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${id}`, { status: 'Accepted' }, authHeader);
                      fetchAll();
                    } catch { } finally { setTeleAction(a => ({ ...a, [id]: '' })); }
                  }}
                  onReject={(consult) => {
                    // Use existing reject flow — pass to TeleConsultCard's reject state
                    if (window.confirm(`Reject consultation from ${consult.mother?.name}?`)) {
                      const note = window.prompt('Reason (optional):') || '';
                      axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${consult._id}`, { status: 'Rejected', doctorNote: note }, authHeader)
                        .then(() => fetchAll()).catch(() => { });
                    }
                  }}
                  onComplete={async (id) => {
                    try {
                      await axios.put(`${import.meta.env.VITE_API_URL}/teleconsult/${id}`, { status: 'Completed' }, authHeader);
                      fetchAll();
                    } catch { }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ASHA Workers View ── */}
      {activeView === 'ashas' && (
        <div className="space-y-8">
          {/* Pending ASHAs */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">Pending ASHA Workers (Nearby)</h2>
            {pendingAshas.length === 0 ? (
              <p className="text-gray-500">No pending ASHA workers in your region.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAshas.map(a => (
                  <div key={a._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{a.user?.name}</p>
                      <p className="text-xs text-slate-500">{a.user?.email} • Region: {a.region}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptAsha(a._id)} className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">Accept</button>
                      <button onClick={() => handleRejectAsha(a._id)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accepted ASHAs & Assignment */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">Schedule ASHA Visit</h2>
            <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" value={assignMotherId} onChange={e => setAssignMotherId(e.target.value)}>
                  <option value="">Select Mother...</option>
                  {assignableMothers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" value={assignAshaId} onChange={e => setAssignAshaId(e.target.value)}>
                  <option value="">Select Accepted ASHA...</option>
                  {acceptedAshas.map(a => <option key={a._id} value={a._id}>{a.user?.name} ({a.region})</option>)}
                </select>
                <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                <input type="time" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                <input type="text" placeholder="Location (Optional)" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2" value={scheduleLocation} onChange={e => setScheduleLocation(e.target.value)} />
              </div>

              {/* Show Mother's ASHA History */}
              {motherAshaHistory && (
                <div className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-1">Fixed / Primary ASHA</p>
                            {motherAshaHistory.fixedAsha ? (
                                <p className="text-sm font-bold text-emerald-700">
                                    {motherAshaHistory.fixedAsha.name}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No fixed ASHA assigned</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-1">Last Visited By</p>
                            {motherAshaHistory.lastVisit ? (
                                <div>
                                    <p className="text-sm font-bold text-sky-700">
                                        {motherAshaHistory.lastVisit.ashaWorker?.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        On {new Date(motherAshaHistory.lastVisit.visitDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No previous visits</p>
                            )}
                        </div>
                    </div>
                </div>
              )}

              {/* Show ASHA's existing schedule for the date */}
              {scheduleDate && assignAshaId && (
                <div className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <p className="text-sm font-bold text-teal-700 mb-2">ASHA's Schedule on {new Date(scheduleDate).toLocaleDateString()}</p>
                    {ashaScheduleForDate.length === 0 ? (
                        <p className="text-xs text-slate-500">No visits scheduled. Free to assign anytime.</p>
                    ) : (
                        <div className="space-y-2">
                            {ashaScheduleForDate.map(s => (
                                <div key={s._id} className="flex justify-between items-center text-xs text-slate-600">
                                    <span>🕒 {s.time} - {s.mother?.name || 'Mother'}</span>
                                    <span>📍 {s.location || 'Home'}</span>
                                </div>
                            ))}
                            <p className="text-xs text-amber-700 mt-2">🚗 Note: Travel time from previous location is approx. 15 minutes.</p>
                        </div>
                    )}
                </div>
              )}

              <button onClick={handleAssignAsha} className="w-full bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold mb-6">Schedule Visit</button>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Your Accepted ASHAs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {acceptedAshas.length === 0 ? <span className="text-gray-500 text-sm">None accepted yet.</span> : acceptedAshas.map(a => (
                    <div key={a._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={a.user?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${a.user?.name}`} alt="ASHA" className="w-10 h-10 rounded-full object-cover border border-teal-500/30" />
                        <div>
                          <p className="text-sm font-bold text-teal-300">{a.user?.name}</p>
                          <p className="text-xs text-teal-100/50 flex items-center gap-1"><MapPin size={10} /> {a.region}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedAsha(a)} className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center hover:bg-teal-500/40 transition-colors" title="View Details">
                        <Info size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ASHA Info Modal */}
            <AnimatePresence>
                {selectedAsha && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-200 shadow-xl relative">
                            <button onClick={() => setSelectedAsha(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
                            
                            <div className="text-center mb-6">
                                <img src={selectedAsha.user?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAsha.user?.name}`} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-teal-50 mb-3 shadow-sm" alt="ASHA" />
                                <h3 className="text-xl font-black text-slate-900">{selectedAsha.user?.name}</h3>
                                <span className="inline-block mt-1 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">ASHA Worker</span>
                            </div>
                            
                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="bg-sky-100 p-2 rounded-lg text-sky-600"><Mail size={16} /></div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Email Address</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedAsha.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><MapPin size={16} /></div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Service Region</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedAsha.region || 'Not specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><CalIcon size={16} /></div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Joined On</p>
                                        <p className="text-sm font-semibold text-slate-800">{new Date(selectedAsha.user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAsha(null)} className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Close Details</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Profile View ── */}
      {activeView === 'profile' && (
        <>
          {doctorProfile?.isListed ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                <Lock size={28} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Locked</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Your profile is publicly listed and locked from editing to maintain data consistency for patients.
                Contact the MaaCare admin if you need to make any changes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
                {[
                  ['Specialization', doctorProfile?.specialistType || doctorProfile?.specialization],
                  ['Experience', `${doctorProfile?.experienceYears || 0} years`],
                  ['Fee', `₹${doctorProfile?.consultationFee || 0}`],
                  ['Available Days', doctorProfile?.availableDays?.join(', ') || 'N/A'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-100 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">{label}</p>
                    <p className="text-slate-800 font-semibold text-sm">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DoctorForm onProfileUpdated={fetchAll} />
          )}
        </>
      )}

      {/* ── Appointments View ── */}
      {activeView === 'appointments' && (
        <>
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
            {Object.keys(tabCounts).map(status => {
              const cfg = statusConfig[status] || {};
              return (
                <button key={status} onClick={() => setActiveTab(status)}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${activeTab === status ? `${cfg.color} shadow-sm` : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                  {status}
                  <span className={`text-xs font-extrabold w-5 h-5 flex items-center justify-center rounded-full ${activeTab === status ? 'bg-white/20' : 'bg-white/5'}`}>
                    {tabCounts[status]}
                  </span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card text-center p-16">
              <CalIcon className="mx-auto h-12 w-12 text-gray-700 mb-4" />
              <p className="text-gray-500">No {activeTab.toLowerCase()} appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(apt => {
                const cfg = statusConfig[apt.status] || statusConfig.Pending;
                return (
                  <motion.div key={apt._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 hover:border-teal-500/20 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-5">
                      <div className="flex gap-4 items-start">
                        <img
                          src={apt.mother?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${apt.patientName}`}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                          alt="Patient"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{apt.patientName}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Mail size={12} />{apt.patientEmail}</span>
                            {apt.patientMobile && <span className="flex items-center gap-1"><Phone size={12} />{apt.patientMobile}</span>}
                            <span className="flex items-center gap-1"><CalIcon size={12} />{new Date(apt.date).toLocaleDateString('en-IN')}</span>
                            <span className="flex items-center gap-1 text-sky-700 font-mono font-bold"><Hash size={12} />{apt.appointmentId}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                            <span>Mode: <strong className="text-slate-800">{apt.mode}</strong></span>
                            <span>Time: <strong className="text-slate-800">{apt.time}</strong></span>
                            {apt.pregnancyMonth && <span>Preg. Month: <strong className="text-slate-800">{apt.pregnancyMonth}</strong></span>}
                            {apt.assignedAshaName && <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 rounded font-medium text-[11px]">ASHA: {apt.assignedAshaName}</span>}
                          </div>
                          {apt.previousHealthProblem && (
                            <p className="text-xs mt-2 text-slate-600 bg-sky-50/80 border border-sky-200 px-3 py-2 rounded-lg max-w-md">
                              <strong>Health Notes:</strong> {apt.previousHealthProblem}
                            </p>
                          )}
                          {apt.attachment?.url && (
                            <a href={apt.attachment.url} target="_blank" rel="noreferrer"
                              className="text-xs text-teal-400 hover:underline mt-2 flex items-center gap-1">
                              <FileText size={13} /> View Attachment
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {apt.status}
                        </span>
                        {apt.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(apt._id)} disabled={actionLoading === apt._id}
                              className="flex items-center gap-1 text-xs bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-70">
                              <CheckCircle size={13} />{actionLoading === apt._id ? '...' : 'Approve'}
                            </button>
                            <button onClick={() => setRejectTarget(apt)}
                              className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold transition-all">
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        )}
                        {apt.status === 'Approved' && (
                          <button onClick={() => setRescheduleTarget(apt)}
                            className="flex items-center gap-1 text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-xl font-bold transition-all">
                            <RefreshCw size={13} /> Reschedule
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Prescription Section ── */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button onClick={() => setRxExpanded(p => ({ ...p, [apt._id]: !p[apt._id] }))}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        <Paperclip size={13} />
                        {apt.prescription?.url ? 'Update Prescription' : 'Upload Prescription'}
                        {rxExpanded[apt._id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {/* Existing prescription link */}
                      {apt.prescription?.url && !rxExpanded[apt._id] && (
                        <div className="mt-2 flex items-center gap-3">
                          <a href={apt.prescription.url} target="_blank" rel="noreferrer"
                            className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                            <FileText size={12} /> View Prescription
                          </a>
                          <span className="text-xs text-gray-600">
                            {apt.prescription.uploadedAt ? new Date(apt.prescription.uploadedAt).toLocaleDateString('en-IN') : ''}
                          </span>
                        </div>
                      )}

                      {/* Upload form */}
                      {rxExpanded[apt._id] && (
                        <div className="mt-3 space-y-2">
                          <label className="flex items-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors">
                            <Upload size={13} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {rxFile[apt._id] ? rxFile[apt._id].name : 'Choose file (PDF or image)'}
                            </span>
                            <input type="file" accept="image/*,application/pdf"
                              onChange={e => setRxFile(f => ({ ...f, [apt._id]: e.target.files[0] }))}
                              className="hidden" />
                          </label>
                          <input type="text" placeholder="Doctor's note (optional)"
                            value={rxNotes[apt._id] || ''}
                            onChange={e => setRxNotes(n => ({ ...n, [apt._id]: e.target.value }))}
                            className="dark-input text-xs py-2" />
                          <div className="flex gap-2">
                            <button
                              disabled={!rxFile[apt._id] || rxUploading[apt._id]}
                              onClick={async () => {
                                setRxUploading(u => ({ ...u, [apt._id]: true }));
                                try {
                                  const fd = new FormData();
                                  fd.append('prescriptionFile', rxFile[apt._id]);
                                  if (rxNotes[apt._id]) fd.append('notes', rxNotes[apt._id]);
                                  await axios.put(`${import.meta.env.VITE_API_URL}/appointments/${apt._id}/prescription`, fd, authHeader);
                                  setRxExpanded(p => ({ ...p, [apt._id]: false }));
                                  setRxFile(f => ({ ...f, [apt._id]: null }));
                                  setRxNotes(n => ({ ...n, [apt._id]: '' }));
                                  fetchAll();
                                } catch (e) { alert(e.response?.data?.message || 'Upload failed'); }
                                finally { setRxUploading(u => ({ ...u, [apt._id]: false })); }
                              }}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                              {rxUploading[apt._id] ? <div className="animate-spin h-3 w-3 border border-white/40 border-t-white rounded-full" /> : <Upload size={12} />}
                              {rxUploading[apt._id] ? 'Uploading…' : 'Upload'}
                            </button>
                            <button onClick={() => setRxExpanded(p => ({ ...p, [apt._id]: false }))}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-white/10 transition-all">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Live Patient ASHA Visits ── */}
      {activeView === 'appointments' && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Live Patient ASHA Visits <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            </h2>
          </div>
          {patientAshaSchedules.length === 0 ? (
            <div className="glass-card text-center p-10">
              <User className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <p className="text-slate-500 text-sm">No upcoming ASHA visits scheduled for your patients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {patientAshaSchedules.map((schedule) => (
                <div key={schedule._id} className="glass-card-elevated p-4 flex flex-col md:flex-row justify-between gap-4 items-center border border-slate-200 hover:border-emerald-500/30 transition-colors">
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    <img src={schedule.mother?.profileImage?.url || 'https://i.pravatar.cc/60?img=1'} alt="Mother" className="w-10 h-10 rounded-full border border-slate-300 object-cover" />
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">{schedule.mother?.name || 'Unknown Patient'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={12} /> ASHA: {schedule.ashaWorker?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-sm font-bold text-emerald-700">
                      {new Date(schedule.date).toLocaleDateString('en-IN')} at {schedule.time}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-medium flex items-center md:justify-end gap-1">
                      <Clock size={12} /> Status: <span className={schedule.status === 'Cancelled' ? 'text-rose-600' : schedule.status === 'Completed' ? 'text-sky-600' : 'text-amber-600'}>{schedule.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
