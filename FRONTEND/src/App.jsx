import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-[#030712] text-white">
        <Navbar />
        <VoiceNavigator />
        <main className="container mx-auto px-4 py-8">
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
      </div>
    </Router>
  );
};

export default App;
