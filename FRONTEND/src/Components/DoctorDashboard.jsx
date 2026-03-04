import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, RefreshCw, Hash, FileText,
  Calendar as CalIcon, User, Mail, Phone, Building2,
  BriefcaseMedical, Star, Lock, AlertCircle, Video, Upload, ChevronDown, ChevronUp, Paperclip
} from 'lucide-react';
import DoctorForm from './DoctorForm';
import TeleConsultCard from './TeleConsultCard';
import { Link } from 'react-router-dom';

const statusConfig = {
  Pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  Approved: { color: 'bg-green-500/10  text-green-400  border-green-500/20', dot: 'bg-green-400' },
  Rejected: { color: 'bg-red-500/10    text-red-400    border-red-500/20', dot: 'bg-red-400' },
  Cancelled: { color: 'bg-gray-500/10   text-gray-400   border-gray-500/20', dot: 'bg-gray-400' },
  Completed: { color: 'bg-blue-500/10   text-blue-400   border-blue-500/20', dot: 'bg-blue-400' },
  Rescheduled: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
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
      const [aptRes, profileRes, tcRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/appointments`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/profile`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/teleconsult/doctor`, authHeader),
      ]);
      setAppointments(aptRes.data);
      setDoctorProfile(profileRes.data);
      setTeleConsults(tcRes.data || []);
    } catch (err) {
      console.error('Doctor dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

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
    <div className="max-w-7xl mx-auto py-10 px-4">

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card-elevated p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-red-400 mb-1">Reject Appointment</h3>
              <p className="text-sm text-gray-500 mb-1">ID: <span className="font-mono text-teal-400">{rejectTarget.appointmentId}</span></p>
              <p className="text-sm text-gray-500 mb-4">Patient: <span className="text-white font-semibold">{rejectTarget.patientName}</span></p>
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
              <h3 className="text-xl font-bold text-white mb-1">Reschedule Appointment</h3>
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
          <h1 className="text-3xl font-extrabold text-white mt-2">Dr. {user?.name}</h1>
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
              <p className="text-2xl font-extrabold text-white">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{status}</p>
            </div>
          );
        })}
      </div>

      {/* ── View Switcher ── */}
      <div className="flex gap-2 mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {['appointments', 'teleconsult', 'profile'].map(v => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`px-6 py-2.5 rounded-xl font-bold capitalize transition-all text-sm ${activeView === v ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-white'}`}>
            {v === 'appointments' ? '📋 Appointments' : v === 'teleconsult' ? '📞 Tele-Consult' : '👤 Profile & Listing'}
          </button>
        ))}
      </div>

      {/* ── Tele-Consult View ── */}
      {activeView === 'teleconsult' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Video size={20} className="text-indigo-400" /> Tele-Consultation Requests
            </h2>
            <Link to="/teleconsult" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors">
              Open Full Page →
            </Link>
          </div>
          {teleConsults.length === 0 ? (
            <div className="glass-card p-14 text-center">
              <Video className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-white font-bold">No tele-consult requests yet</p>
              <p className="text-sm text-gray-500 mt-1">Requests from patients will appear here.</p>
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

      {/* ── Profile View ── */}
      {activeView === 'profile' && (
        <>
          {doctorProfile?.isListed ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                <Lock size={28} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2">Profile Locked</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
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
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-600 uppercase font-bold mb-1">{label}</p>
                    <p className="text-white font-semibold text-sm">{val}</p>
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
                          <h3 className="font-bold text-lg text-white">{apt.patientName}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Mail size={12} />{apt.patientEmail}</span>
                            {apt.patientMobile && <span className="flex items-center gap-1"><Phone size={12} />{apt.patientMobile}</span>}
                            <span className="flex items-center gap-1"><CalIcon size={12} />{new Date(apt.date).toLocaleDateString('en-IN')}</span>
                            <span className="flex items-center gap-1 text-teal-400 font-mono font-bold"><Hash size={12} />{apt.appointmentId}</span>
                          </div>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>Mode: <strong className="text-gray-300">{apt.mode}</strong></span>
                            <span>Time: <strong className="text-gray-300">{apt.time}</strong></span>
                            {apt.pregnancyMonth && <span>Preg. Month: <strong className="text-gray-300">{apt.pregnancyMonth}</strong></span>}
                          </div>
                          {apt.previousHealthProblem && (
                            <p className="text-xs mt-2 text-gray-500 bg-white/5 border border-white/10 px-3 py-2 rounded-lg max-w-md">
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
    </div>
  );
};

export default DoctorDashboard;
