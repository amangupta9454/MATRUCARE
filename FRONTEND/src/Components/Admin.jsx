import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Stethoscope, Calendar, CheckCircle2, XCircle, RefreshCw,
  Search, Shield, Trash2, Baby, Clock, Building2, Hash, Phone,
  BriefcaseMedical, AlertTriangle, ChevronDown, ChevronUp, Mail
} from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold text-white">{value ?? '—'}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
  </motion.div>
);

const Admin = () => {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = async () => {
    try {
      const [statsRes, doctorsRes, appointmentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/admin-stats`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/doctors/all`, authHeader),
        axios.get(`${import.meta.env.VITE_API_URL}/appointments`, authHeader),
      ]);
      setStats(statsRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);

      const patientMap = {};
      appointmentsRes.data.forEach(apt => {
        if (apt.mother?._id && !patientMap[apt.mother._id]) {
          patientMap[apt.mother._id] = {
            _id: apt.mother._id,
            name: apt.patientName || apt.mother.name,
            email: apt.patientEmail || apt.mother.email,
            mobile: apt.patientMobile,
            profileImage: apt.mother.profileImage,
            appointments: [],
          };
        }
        if (apt.mother?._id) {
          patientMap[apt.mother._id].appointments.push(apt);
        }
      });
      setPatients(Object.values(patientMap));
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/doctors/${id}/approve`, {}, authHeader);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally { setActionLoading(''); }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this doctor from the listing?')) return;
    setActionLoading(id + '_remove');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/doctors/${id}`, authHeader);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Remove failed');
    } finally { setActionLoading(''); }
  };

  const filteredDoctors = doctors.filter(d =>
    (d.user?.name + d.user?.email + d.specialization + d.specialistType)
      .toLowerCase().includes(search.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    (p.name + p.email).toLowerCase().includes(patientSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  // ── Forum Moderation inner component (defined before main return) ───────────
  const ForumModeration = () => {
    const [fmPosts, setFmPosts] = React.useState([]);
    const [fmLoading, setFmLoading] = React.useState(true);
    React.useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/forum`)
        .then(r => setFmPosts(r.data.posts || []))
        .catch(() => { })
        .finally(() => setFmLoading(false));
    }, []);
    const fmAction = async (method, url) => {
      try {
        await axios[method](url, {}, { headers: { Authorization: `Bearer ${token}` } });
        const r = await axios.get(`${import.meta.env.VITE_API_URL}/forum`);
        setFmPosts(r.data.posts || []);
      } catch { }
    };
    if (fmLoading) return <div className="text-gray-500 text-sm py-4">Loading posts…</div>;
    return (
      <div className="space-y-3">
        {fmPosts.length === 0 && <p className="text-gray-500 text-sm">No forum posts yet.</p>}
        {fmPosts.map(p => (
          <div key={p._id} className={`glass-card p-4 flex items-start justify-between gap-4 border ${p.isPinned ? 'border-yellow-500/30' : 'border-white/10'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center mb-1">
                {p.isPinned && <span className="text-yellow-400 text-xs font-bold">📌 Pinned</span>}
                {p.isBanned && <span className="text-red-400 text-xs font-bold">🚫 Banned</span>}
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{p.category}</span>
              </div>
              <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.author?.name} · {new Date(p.createdAt).toLocaleDateString('en-IN')} · ❤️ {p.likes?.length || 0}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => fmAction('put', `${import.meta.env.VITE_API_URL}/forum/${p._id}/pin`)}
                className="text-xs text-yellow-400 border border-yellow-500/20 px-2.5 py-1.5 rounded-lg transition-all hover:text-yellow-300">
                {p.isPinned ? 'Unpin' : 'Pin'}
              </button>
              {!p.isBanned && (
                <button onClick={() => { if (window.confirm('Ban this post?')) fmAction('put', `${import.meta.env.VITE_API_URL}/forum/${p._id}/ban`); }}
                  className="text-xs text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-all hover:text-red-300">
                  Ban
                </button>
              )}
              <button onClick={() => { if (window.confirm('Delete permanently?')) fmAction('delete', `${import.meta.env.VITE_API_URL}/forum/${p._id}`); }}
                className="text-xs text-gray-400 border border-white/10 px-2.5 py-1.5 rounded-lg transition-all hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">

      {/* ── ADMIN IDENTITY CARD ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-7 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="bg-teal-500/20 border border-teal-500/30 p-5 rounded-2xl">
          <Shield size={36} className="text-teal-400" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Super Admin
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">{user?.name}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail size={14} />{user?.email}</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-600">Platform</p>
          <p className="text-2xl font-extrabold gradient-text">MaaCare</p>
          <p className="text-xs text-gray-600 mt-1">Admin Control Panel</p>
        </div>
      </motion.div>

      {/* ── STATS GRID ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Baby size={22} className="text-pink-400" />} label="Total Patients" value={stats?.totalPatients} color="bg-pink-500/10" />
          <StatCard icon={<Stethoscope size={22} className="text-teal-400" />} label="Total Doctors" value={stats?.totalDoctors} color="bg-teal-500/10" />
          <StatCard icon={<Calendar size={22} className="text-blue-400" />} label="Total Appointments" value={stats?.totalAppointments} color="bg-blue-500/10" />
          <StatCard icon={<Clock size={22} className="text-yellow-400" />} label="Today's" value={stats?.todayAppointments} color="bg-yellow-500/10" />
          <StatCard icon={<RefreshCw size={22} className="text-purple-400" />} label="Rescheduled" value={stats?.rescheduledAppointments} color="bg-purple-500/10" />
          <StatCard icon={<XCircle size={22} className="text-red-400" />} label="Cancelled" value={stats?.cancelledAppointments} color="bg-red-500/10" />
        </div>
      </div>

      {/* ── DOCTORS SECTION ── */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Stethoscope size={20} className="text-teal-400" /> Doctor Management
            <span className="text-sm font-bold text-gray-500">({doctors.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search doctors..." value={search}
              onChange={e => setSearch(e.target.value)} className="dark-input pl-9" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredDoctors.length === 0 && (
            <div className="glass-card p-10 text-center text-gray-500">No doctors found.</div>
          )}
          {filteredDoctors.map(doc => {
            const isExpanded = expandedDoctor === doc._id;
            const isListed = doc.isListed;
            const isApproved = doc.isApproved;
            return (
              <motion.div key={doc._id} layout className="glass-card overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5">
                  <img src={doc.user?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.user?.name}`}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0" alt={doc.user?.name} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg">Dr. {doc.user?.name}</h3>
                    <p className="text-gray-500 text-sm">{doc.user?.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <BriefcaseMedical size={11} />{doc.specialistType || doc.specialization || 'Specialist'}
                      </span>
                      {doc.experienceYears > 0 && (
                        <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-lg">{doc.experienceYears} yrs exp</span>
                      )}
                      {doc.consultationFee > 0 && (
                        <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded-lg">₹{doc.consultationFee}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!isListed && <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 border border-gray-500/20 text-gray-400">Not Listed</span>}
                    {isListed && !isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <AlertTriangle size={11} /> Pending Approval
                      </span>
                    )}
                    {isListed && isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}
                    {isListed && !isApproved && (
                      <button onClick={() => handleApprove(doc._id)} disabled={actionLoading === doc._id + '_approve'}
                        className="flex items-center gap-1 text-xs bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-3 py-2 rounded-xl font-bold transition-all disabled:opacity-60">
                        <CheckCircle2 size={13} /> {actionLoading === doc._id + '_approve' ? '...' : 'Approve'}
                      </button>
                    )}
                    {isListed && (
                      <button onClick={() => handleRemove(doc._id)} disabled={actionLoading === doc._id + '_remove'}
                        className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-2 rounded-xl font-bold transition-all disabled:opacity-60">
                        <Trash2 size={13} /> {actionLoading === doc._id + '_remove' ? '...' : 'Remove'}
                      </button>
                    )}
                    <button onClick={() => setExpandedDoctor(isExpanded ? null : doc._id)}
                      className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 overflow-hidden">
                      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Qualifications</p><p className="text-gray-300">{doc.qualifications?.join(', ') || 'N/A'}</p></div>
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Current Org</p><p className="text-gray-300 flex items-center gap-1"><Building2 size={13} />{doc.currentOrganization || 'N/A'}</p></div>
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Mobile</p><p className="text-gray-300 flex items-center gap-1"><Phone size={13} />{doc.mobile || 'N/A'}</p></div>
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Available Days</p><p className="text-gray-300">{doc.availableDays?.join(', ') || 'N/A'}</p></div>
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Time Slots</p><p className="text-gray-300">{doc.availableSlots?.join(', ') || 'N/A'}</p></div>
                        <div><p className="text-gray-600 text-xs uppercase font-bold mb-1">Field of Exp.</p><p className="text-gray-300">{doc.fieldOfExperience || 'N/A'}</p></div>
                        <div className="md:col-span-2"><p className="text-gray-600 text-xs uppercase font-bold mb-1">Bio</p><p className="text-gray-400 text-xs leading-relaxed">{doc.bio || 'No bio provided.'}</p></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── PATIENTS SECTION ── */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Baby size={20} className="text-pink-400" /> Patient Records
            <span className="text-sm font-bold text-gray-500">({patients.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search patients..." value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)} className="dark-input pl-9" />
          </div>
        </div>
        <div className="space-y-4">
          {filteredPatients.length === 0 && (
            <div className="glass-card p-10 text-center text-gray-500">
              {patients.length === 0 ? 'No appointment data yet — patient records appear here after first booking.' : 'No patients match your search.'}
            </div>
          )}
          {filteredPatients.map(p => (
            <div key={p._id} className="glass-card p-5 flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4 flex-1">
                <img src={p.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10" alt={p.name} />
                <div>
                  <h3 className="font-bold text-white">{p.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1"><Mail size={12} />{p.email}</p>
                  {p.mobile && <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5"><Phone size={12} />{p.mobile}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                {['Pending', 'Approved', 'Cancelled'].map(s => (
                  <div key={s}>
                    <p className="text-lg font-extrabold text-white">{p.appointments.filter(a => a.status === s).length}</p>
                    <p className="text-xs text-gray-600">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORUM MODERATION ── */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-5">
          <Shield size={20} className="text-red-400" /> Forum Moderation
        </h2>
        <ForumModeration />
      </div>

    </div>
  );
};

export default Admin;
