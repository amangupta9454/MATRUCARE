import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Doctors from './Pages/Doctors';
import HealthDashboard from './Pages/HealthDashboard';
import Hospitals from './Pages/Hospitals';
import GovernmentSchemes from './Pages/GovernmentSchemes';
import AshaVisits from './Pages/AshaVisits';
import Analytics from './Pages/Analytics';
import BabyDashboard from './Pages/BabyDashboard';
import HealthRecords from './Pages/HealthRecords';
import Insights from './Pages/Insights';
import TeleConsult from './Pages/TeleConsult';
import HospitalDetails from './Pages/HospitalDetails';
import HospitalDashboard from './Pages/HospitalDashboard';
import MentorCommunity from './Pages/MentorCommunity';
import TeleConsultRoom from './Components/TeleConsultRoom';
import Forum from './Pages/Forum';
import DoctorReviews from './Pages/DoctorReviews';
import RecommendedDoctors from './Pages/RecommendedDoctors';
import Reviews from './Pages/Reviews';
import Education from './Pages/Education';
import Login from './Components/Login';
import Register from './Components/Register';
import VerifyOtp from './Components/VerifyOtp';
import ResendOtp from './Components/ResendOtp';
import ForgetPassword from './Components/ForgetPassword';
import MotherDashboard from './Components/MotherDashboard';
import DoctorDashboard from './Components/DoctorDashboard';
import AshaWorkerDashboard from './Components/AshaWorkerDashboard';
import Admin from './Components/Admin';
import VoiceNavigator from './Components/VoiceNavigator';
import { AuthContext } from './Components/AuthContext';
import { useContext } from 'react';
import { HeartPulse, Phone, Mail, MapPin, Shield, Stethoscope, Activity } from 'lucide-react';

// --- New Feature Pages ---
import InsuranceDashboard from './Pages/InsuranceDashboard';
import HealthPassport from './Pages/HealthPassport';
import HealthNavigation from './Pages/HealthNavigation';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#f0f7ff] text-slate-800 flex flex-col font-sans">
        <Navbar />
        <VoiceNavigator />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/hospitals/:id" element={<HospitalDetails />} />
            <Route path="/mentor-community" element={<MentorCommunity />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<Forum />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/education" element={<Education />} />
            <Route path="/recommended-doctors" element={<RecommendedDoctors />} />
            <Route path="/doctors/:doctorId/reviews" element={<DoctorReviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/resend-otp" element={<ResendOtp />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            {/* Mother routes */}
            <Route path="/dashboard/mother" element={<ProtectedRoute allowedRoles={['Mother']}><MotherDashboard /></ProtectedRoute>} />
            <Route path="/health-dashboard" element={<ProtectedRoute allowedRoles={['Mother']}><HealthDashboard /></ProtectedRoute>} />
            <Route path="/baby-dashboard" element={<ProtectedRoute allowedRoles={['Mother']}><BabyDashboard /></ProtectedRoute>} />
            <Route path="/health-records" element={<ProtectedRoute allowedRoles={['Mother']}><HealthRecords /></ProtectedRoute>} />
            <Route path="/teleconsult" element={<ProtectedRoute allowedRoles={['Mother', 'Doctor']}><TeleConsult /></ProtectedRoute>} />
            <Route path="/teleconsult/room/:consultId" element={<ProtectedRoute allowedRoles={['Mother', 'Doctor']}><TeleConsultRoom /></ProtectedRoute>} />

            {/* Doctor routes */}
            <Route path="/dashboard/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />

            {/* ASHA routes */}
            <Route path="/dashboard/asha" element={<ProtectedRoute allowedRoles={['ASHA']}><AshaWorkerDashboard /></ProtectedRoute>} />
            <Route path="/asha-visits" element={<ProtectedRoute allowedRoles={['ASHA']}><AshaVisits /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['Admin']}><Admin /></ProtectedRoute>} />

            {/* Hospital routes */}
            <Route path="/dashboard/hospital" element={<ProtectedRoute allowedRoles={['Hospital']}><HospitalDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute allowedRoles={['Admin']}><Insights /></ProtectedRoute>} />

            {/* New Features (Insurance, Passport, Navigation/Emergency) */}
            <Route path="/insurance" element={<ProtectedRoute allowedRoles={['Mother', 'Doctor', 'ASHA']}><InsuranceDashboard /></ProtectedRoute>} />
            <Route path="/passport" element={<ProtectedRoute allowedRoles={['Mother', 'Doctor', 'ASHA']}><HealthPassport /></ProtectedRoute>} />
            <Route path="/navigation" element={<ProtectedRoute allowedRoles={['Mother', 'Doctor', 'ASHA']}><HealthNavigation /></ProtectedRoute>} />

          </Routes>
        </main>

        {/* Hospital Light White-Blue Footer */}
        <footer className="bg-gradient-to-b from-white to-sky-50 border-t border-sky-100 mt-16 pt-12 pb-8 text-slate-700">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-sky-600 text-white p-2.5 rounded-xl shadow-md shadow-sky-600/20">
                  <HeartPulse size={22} />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent">
                  MaaCare
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Empowering mothers with AI-driven healthcare, verified specialists, and 24/7 emergency response support.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-100/80 px-3 py-1.5 rounded-full w-fit">
                <Shield size={14} /> Certified Hospital Ecosystem
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-sky-900 mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-sky-600 transition-colors">About MaaCare</Link></li>
                <li><Link to="/doctors" className="hover:text-sky-600 transition-colors">Find Doctors</Link></li>
                <li><Link to="/hospitals" className="hover:text-sky-600 transition-colors">Hospital Network</Link></li>
                <li><Link to="/schemes" className="hover:text-sky-600 transition-colors">Government Schemes</Link></li>
                <li><Link to="/forum" className="hover:text-sky-600 transition-colors">Community Forum</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-sky-900 mb-4">Maternal Services</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/teleconsult" className="hover:text-sky-600 transition-colors">Tele-Consultation</Link></li>
                <li><Link to="/health-dashboard" className="hover:text-sky-600 transition-colors">Pregnancy Tracker</Link></li>
                <li><Link to="/baby-dashboard" className="hover:text-sky-600 transition-colors">Baby Vaccination</Link></li>
                <li><Link to="/passport" className="hover:text-sky-600 transition-colors">Health Passport QR</Link></li>
                <li><Link to="/contact" className="hover:text-sky-600 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-sky-900 mb-4">Emergency & Contact</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone size={16} className="text-sky-600" />
                  <span>24/7 Helpline: 1800-MAACARE</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail size={16} className="text-sky-600" />
                  <span>support@maacare.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <MapPin size={16} className="text-sky-600" />
                  <span>National Health Hub, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 border-t border-sky-200/60 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} MaaCare Health Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/about" className="hover:text-sky-600 transition-colors">Privacy Policy</Link>
              <Link to="/about" className="hover:text-sky-600 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-sky-600 transition-colors">Hospital Portal</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
