<h1 style="color:#d63384;">🤱 MaaCare — Maternal Healthcare Platform</h1>

<p>
A full-stack web application that connects mothers, doctors, hospitals, and ASHA workers across India.
Built with <b>React</b> on the frontend and <b>Node.js</b> on the backend, it covers everything from pregnancy tracking
and teleconsultation to hospital booking with insurance integration, an emergency SOS system,
and a portable <b>Digital Health Passport</b>.
</p>

<hr>

<h2 style="color:#6f42c1;">📑 Table of Contents</h2>

<ul>
<li>🔎 <a href="#what-is-maacare">What is MaaCare</a></li>
<li>👩‍👧 <a href="#who-its-for">Who it's for</a></li>
<li>⚕️ <a href="#what-problems-it-solves">What problems it solves</a></li>
<li>✨ <a href="#features-by-module">Features by module</a></li>
<li>📂 <a href="#project-structure">Project structure</a></li>
<li>💻 <a href="#tech-stack">Tech stack</a></li>
<li>⚙️ <a href="#how-to-run-the-project-locally">How to run the project locally</a></li>
<li>🔑 <a href="#environment-variables">Environment variables</a></li>
<li>🌐 <a href="#all-api-routes-summary">All API routes (summary)</a></li>
<li>👥 <a href="#user-roles-and-permissions">User roles and permissions</a></li>
<li>🧠 <a href="#how-each-major-feature-works">How each major feature works</a></li>
<li>🚀 <a href="#deployment">Deployment</a></li>
<li>📦 <a href="#package-dependencies">Package dependencies</a></li>
<li>📜 <a href="#available-scripts">Available scripts</a></li>
<li>📬 <a href="#contact">Contact</a></li>
</ul>

<hr>


<h2 id="what-is-maacare" style="color:#198754;">🩺 What is MaaCare</h2>

<p>
MaaCare is a healthcare platform designed specifically around maternal and child health in India.
The platform brings together multiple stakeholders — pregnant mothers, specialist doctors,
ASHA (Accredited Social Health Activist) workers, hospitals, and administrators — into one connected system.
</p>

<p align="center">
  <img src="https://res.cloudinary.com/dgtyqhtor/image/upload/v1772701093/system_architecture_emsljr.png" alt="System Architecture Diagram" width="100%">
</p>

<p><b>A mother can use MaaCare to:</b></p>

<ul>
<li>📅 Track her pregnancy week by week</li>
<li>👩‍⚕️ Book an appointment with a gynecologist</li>
<li>💻 Join a video teleconsultation from home</li>
<li>🏥 Find the nearest hospital and book a service</li>
<li>🛡️ Apply her insurance policy at the time of booking</li>
<li>📇 Generate a Digital Health Passport with a QR code (for emergencies)</li>
<li>🚨 Trigger an SOS alert that captures her location and emails her emergency contacts</li>
<li>👶 Track her baby's milestones and vaccination schedule</li>
<li>📖 Get step-by-step guidance for health conditions like anemia or gestational diabetes</li>
</ul>

<hr>

<h2 id="who-its-for" style="color:#fd7e14;">👥 Who It's For</h2>

<p align="center">
  <img src="https://res.cloudinary.com/dgtyqhtor/image/upload/v1772701091/role_matrix_dhh8pc.png" width="100%">
</p>

<table style="border-collapse: collapse; width:100%; text-align:left;">
<thead>
<tr style="background-color:#f8f9fa;">
<th style="border:1px solid #ddd; padding:10px;">Role</th>
<th style="border:1px solid #ddd; padding:10px;">What they use MaaCare for</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd; padding:10px;">🤱 Mother</td>
<td style="border:1px solid #ddd; padding:10px;">
Pregnancy tracking, doctor booking, hospital booking, insurance, SOS, health records
</td>
</tr>

<tr>
<td style="border:1px solid #ddd; padding:10px;">👨‍⚕️ Doctor</td>
<td style="border:1px solid #ddd; padding:10px;">
Managing appointments, teleconsultation, viewing patient records
</td>
</tr>

<tr>
<td style="border:1px solid #ddd; padding:10px;">🧑‍⚕️ ASHA Worker</td>
<td style="border:1px solid #ddd; padding:10px;">
Tracking assigned mothers, scheduling visits, checking government schemes
</td>
</tr>

<tr>
<td style="border:1px solid #ddd; padding:10px;">🏥 Hospital</td>
<td style="border:1px solid #ddd; padding:10px;">
Registering services, managing bookings and bed counts, approving/rejecting bookings
</td>
</tr>

<tr>
<td style="border:1px solid #ddd; padding:10px;">🛠️ Admin</td>
<td style="border:1px solid #ddd; padding:10px;">
Viewing platform analytics and insights, managing all users
</td>
</tr>

</tbody>
</table>

<hr>

<h2 id="what-problems-it-solves" style="color:#dc3545;">⚠️ What Problems It Solves</h2>

<ol style="line-height:1.8;">
<li>🌾 Rural mothers cannot easily access specialist doctors → solved by <b>teleconsultation</b></li>
<li>📊 No centralized pregnancy tracking tool → solved by the <b>pregnancy and baby dashboards</b></li>
<li>🛡️ Insurance complications at hospitals → solved by <b>insurance integration in the booking form</b></li>
<li>🪪 No portable medical identity → solved by the <b>Digital Health Passport and QR code</b></li>
<li>🚨 No way to quickly alert family/doctor in a high-risk emergency → solved by the <b>SOS panel</b></li>
<li>📑 Information scattered across different government portals → solved by the <b>schemes directory</b></li>
<li>🌍 Language barrier between patients and doctors → solved by <b>multilingual real-time chat</b></li>
</ol>

<hr>

<h2 id="features-by-module" style="color:#6f42c1;">✨ Features by Module</h2>

<h3 style="color:#0d6efd;">🔐 Module 1 — Authentication</h3>
<ul>
<li>Registration with role selection (Mother, Doctor, ASHA Worker, Hospital, Admin)</li>
<li>OTP email verification before first login</li>
<li>JWT-based sessions (tokens stored in localStorage)</li>
<li>Forgot password and reset via OTP</li>
<li>Role-based access control on all protected routes</li>
</ul>

<h3 style="color:#0d6efd;">🤰 Module 2 — Pregnancy Tracking</h3>
<ul>
<li>Pregnancy profile: due date, weeks pregnant, trimester, blood pressure, weight</li>
<li>Risk level assessment</li>
<li>Kick counter and contraction timer</li>
<li>Appointment booking with doctors</li>
</ul>

<h3 style="color:#0d6efd;">👨‍⚕️ Module 3 — Doctors</h3>
<ul>
<li>Browse doctors by specialty (Gynecologist, Pediatrician, Cardiologist, etc.)</li>
<li>Doctor profile pages with qualifications, experience, and availability</li>
<li>Availability calendar</li>
<li>Rating and review system</li>
<li>AI-based doctor recommendations by condition</li>
</ul>

<h3 style="color:#0d6efd;">🧑‍⚕️ Module 4 — ASHA Workers</h3>
<ul>
<li>Dashboard for assigned mothers and upcoming visits</li>
<li>Visit scheduling and checklist management</li>
<li>Government scheme lookup and eligibility check</li>
<li>ANC (Antenatal Care) visit tracking</li>
</ul>

<h3 style="color:#0d6efd;">👶 Module 5 — Baby Dashboard</h3>
<ul>
<li>Baby profile: name, birth date, weight, blood group</li>
<li>Milestone tracker</li>
<li>Vaccination schedule with due dates and completion tracking</li>
<li>Growth chart (weight and height over time)</li>
</ul>

<h3 style="color:#0d6efd;">💬 Module 6 — Community</h3>
<ul>
<li>Forum for Q&A discussions among mothers and caregivers</li>
<li>Doctor reviews and ratings</li>
<li>AI-recommended doctors based on health condition</li>
</ul>

<h3 style="color:#0d6efd;">🌿 Module 7 — Wellness</h3>
<ul>
<li>Personalized daily diet plan based on pregnancy stage</li>
<li>Gamified maternal health quiz</li>
<li>Real-time multilingual chat (auto-translates messages)</li>
<li>Platform feedback and star ratings</li>
</ul>

<h3 style="color:#0d6efd;">🏥 Module 8 — Hospitals</h3>
<ul>
<li>Hospital directory with specialties, contact, and rating</li>
<li>Real-time bed availability per ward type</li>
<li>Hospital services listing with prices</li>
<li>Booking a hospital service (with insurance integration)</li>
<li>Booking approval/rejection by hospital admin</li>
<li>Mentor mothers program (experienced mothers support new ones)</li>
<li>Digital health records upload and storage (with Cloudinary)</li>
</ul>

<hr>

<h2 style="color:#198754;">🚀 New Features</h2>

<ul>
<li><b>🛡️ Insurance Management</b> — Add policies, view coverage, check if a hospital is in-network, apply at booking</li>

<li><b>📇 Digital Health Passport</b> — A scannable QR code containing blood type, allergies, conditions, emergency contacts</li>

<li><b>🧭 Health Navigation Assistant</b> — Enter a condition (anemia, hypertension, etc.) and get a step-by-step care journey</li>

<li><b>🚨 Emergency SOS</b> — One-tap button that captures GPS location and emails your doctor, family, and ASHA worker</li>
</ul>

## Project Structure
<pre>
MATRUCARE/
│
├── README.md                 ← This file
├── LICENSE                   ← Project license
│
├── BACKEND/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── initAdmin.js
│   ├── package.json
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── nodemailer.js
│   │   └── cloudinary.js  
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── pregnancyController.js
│   │   ├── babyController.js
│   │   ├── vaccinationController.js
│   │   ├── ashaController.js
│   │   ├── schemeController.js
│   │   ├── teleConsultController.js
│   │   ├── reviewController.js
│   │   ├── forumController.js
│   │   ├── dietController.js
│   │   ├── chatController.js
│   │   ├── quizController.js
│   │   ├── feedbackController.js
│   │   ├── analyticsController.js
│   │   ├── insightsController.js
│   │   ├── reportController.js
│   │   ├── recommendationController.js
│   │   ├── nutritionController.js
│   │   ├── reminderController.js
│   │   ├── hospitalController.js
│   │   ├── hospitalBookingController.js
│   │   ├── healthRecordController.js
│   │   ├── mentorController.js
│   │   ├── insuranceController.js
│   │   ├── healthPassportController.js
│   │   ├── healthNavigationController.js
│   │   └── emergencyController.js
│   │
│   ├── models/    
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── PregnancyProfile.js
│   │   ├── BabyProfile.js
│   │   ├── BabyVaccination.js
│   │   ├── GrowthRecord.js
│   │   ├── ANCVisit.js
│   │   ├── AshaAssignment.js
│   │   ├── VisitLog.js
│   │   ├── HealthRecord.js
│   │   ├── Report.js
│   │   ├── TeleConsult.js
│   │   ├── Review.js
│   │   ├── ForumPost.js
│   │   ├── ForumComment.js
│   │   ├── DietPlan.js
│   │   ├── Message.js
│   │   ├── QuizQuestion.js
│   │   ├── UserProgress.js
│   │   ├── GlobalFeedback.js
│   │   ├── Medicine.js
│   │   ├── SchemeEligibility.js
│   │   ├── OTPVerification.js
│   │   ├── Vaccination.js
│   │   ├── Hospital.js
│   │   ├── HospitalService.js
│   │   ├── BedAvailability.js
│   │   ├── HospitalBooking.js
│   │   ├── MentorMother.js
│   │   ├── InsurancePolicy.js
│   │   ├── HealthPassport.js
│   │   ├── EmergencyContact.js
│   │   └── EmergencyEvent.js
│   │
│   ├── routes/
│   │   └── (one file per feature, named *Routes.js)
│   │
│   └── utils/             
│       ├── roleMiddleware.js
│       ├── notificationScheduler.js
│       ├── reminderScheduler.js
│       └── healthJourneyGenerator.js
│
└── FRONTEND/
    ├── .env 
    ├── .gitignore
    ├── netlify.toml  
    ├── vite.config.js
    ├── package.json
    ├── index.html
    │
    └── src/
        ├── main.jsx  
        ├── App.jsx    
        ├── index.css
        │
        ├── Components/  
        │   ├── AuthContext.jsx
        │   ├── Navbar.jsx 
        │   ├── Login.jsx / Register.jsx
        │   ├── MotherDashboard.jsx / DoctorDashboard.jsx / AshaWorkerDashboard.jsx / Admin.jsx
        │   ├── HospitalBookingForm.jsx
        │   ├── InsuranceCard.jsx / InsuranceForm.jsx
        │   ├── HealthPassportQR.jsx
        │   ├── EmergencySOSPanel.jsx
        │   ├── HealthNavigationAssistant.jsx
        │   └── ... (50+ more)
        │
        └── Pages/            ← 25 full-page components (see FRONTEND/README.md for full list)
            ├── Home.jsx / About.jsx / Contact.jsx
            ├── Hospitals.jsx / HospitalDetails.jsx / HospitalDashboard.jsx
            ├── Doctors.jsx / TeleConsult.jsx
            ├── HealthDashboard.jsx / BabyDashboard.jsx / HealthRecords.jsx
            ├── InsuranceDashboard.jsx / HealthPassport.jsx / HealthNavigation.jsx
            ├── Chat.jsx / Forum.jsx / Reviews.jsx / Education.jsx
            ├── Analytics.jsx / Insights.jsx
            └── ... (10+ more)
</pre>

---

<hr>

<h2 id="tech-stack" style="color:#0d6efd;">💻 Tech Stack</h2>

<h3 style="color:#6f42c1;">⚙️ Backend</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Technology</th>
<th style="border:1px solid #ddd;padding:10px;">Version</th>
<th style="border:1px solid #ddd;padding:10px;">Why we use it</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🟢 Node.js</td>
<td style="border:1px solid #ddd;padding:10px;">18+</td>
<td style="border:1px solid #ddd;padding:10px;">JavaScript runtime for the server</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🚏 Express</td>
<td style="border:1px solid #ddd;padding:10px;">5.2.1</td>
<td style="border:1px solid #ddd;padding:10px;">HTTP server and routing framework</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🍃 MongoDB Atlas</td>
<td style="border:1px solid #ddd;padding:10px;">Cloud</td>
<td style="border:1px solid #ddd;padding:10px;">NoSQL database for all application data</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📦 Mongoose</td>
<td style="border:1px solid #ddd;padding:10px;">9.2.3</td>
<td style="border:1px solid #ddd;padding:10px;">Schema definitions and database queries</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔑 jsonwebtoken</td>
<td style="border:1px solid #ddd;padding:10px;">9.0.3</td>
<td style="border:1px solid #ddd;padding:10px;">Generates and verifies JWT auth tokens</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔒 bcrypt</td>
<td style="border:1px solid #ddd;padding:10px;">6.0.0</td>
<td style="border:1px solid #ddd;padding:10px;">Hashing user passwords before storing</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📧 nodemailer</td>
<td style="border:1px solid #ddd;padding:10px;">8.0.1</td>
<td style="border:1px solid #ddd;padding:10px;">Sends OTP, confirmation, and alert emails via Gmail</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">☁️ cloudinary</td>
<td style="border:1px solid #ddd;padding:10px;">2.9.0</td>
<td style="border:1px solid #ddd;padding:10px;">Cloud storage for uploaded images and documents</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📤 multer</td>
<td style="border:1px solid #ddd;padding:10px;">2.1.0</td>
<td style="border:1px solid #ddd;padding:10px;">Parses file uploads before sending to Cloudinary</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔌 socket.io</td>
<td style="border:1px solid #ddd;padding:10px;">4.8.3</td>
<td style="border:1px solid #ddd;padding:10px;">WebSocket server for real-time chat and SOS</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⏰ node-cron</td>
<td style="border:1px solid #ddd;padding:10px;">4.2.1</td>
<td style="border:1px solid #ddd;padding:10px;">Schedules daily reminder emails and notifications</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌍 google-translate-api-x</td>
<td style="border:1px solid #ddd;padding:10px;">10.7.2</td>
<td style="border:1px solid #ddd;padding:10px;">Auto-translates chat messages</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🛡️ helmet</td>
<td style="border:1px solid #ddd;padding:10px;">8.1.0</td>
<td style="border:1px solid #ddd;padding:10px;">Adds security HTTP headers to every response</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔗 cors</td>
<td style="border:1px solid #ddd;padding:10px;">2.8.6</td>
<td style="border:1px solid #ddd;padding:10px;">Allows only the frontend URL to call the API</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚙️ dotenv</td>
<td style="border:1px solid #ddd;padding:10px;">17.3.1</td>
<td style="border:1px solid #ddd;padding:10px;">Loads .env variables into process.env</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔄 nodemon</td>
<td style="border:1px solid #ddd;padding:10px;">3.1.14</td>
<td style="border:1px solid #ddd;padding:10px;">Dev tool: auto-restarts server on file save</td>
</tr>

</tbody>
</table>

<br>

<h3 style="color:#6f42c1;">🎨 Frontend</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Technology</th>
<th style="border:1px solid #ddd;padding:10px;">Version</th>
<th style="border:1px solid #ddd;padding:10px;">Why we use it</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚛️ React</td>
<td style="border:1px solid #ddd;padding:10px;">19.2.0</td>
<td style="border:1px solid #ddd;padding:10px;">Component-based UI framework</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚡ Vite</td>
<td style="border:1px solid #ddd;padding:10px;">7.3.1</td>
<td style="border:1px solid #ddd;padding:10px;">Build tool with instant hot reload</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🧭 react-router-dom</td>
<td style="border:1px solid #ddd;padding:10px;">7.13.1</td>
<td style="border:1px solid #ddd;padding:10px;">Client-side routing and navigation</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎨 tailwindcss</td>
<td style="border:1px solid #ddd;padding:10px;">4.2.1</td>
<td style="border:1px solid #ddd;padding:10px;">Utility CSS — used for all styling</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎞️ framer-motion</td>
<td style="border:1px solid #ddd;padding:10px;">12.34.4</td>
<td style="border:1px solid #ddd;padding:10px;">Animations (page enter, card hover effects)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌐 axios</td>
<td style="border:1px solid #ddd;padding:10px;">1.13.6</td>
<td style="border:1px solid #ddd;padding:10px;">HTTP client for calling the backend API</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎯 lucide-react</td>
<td style="border:1px solid #ddd;padding:10px;">0.576.0</td>
<td style="border:1px solid #ddd;padding:10px;">Icon library (500+ icons)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔌 socket.io-client</td>
<td style="border:1px solid #ddd;padding:10px;">4.8.3</td>
<td style="border:1px solid #ddd;padding:10px;">WebSocket client for real-time chat and SOS</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📷 react-qr-code</td>
<td style="border:1px solid #ddd;padding:10px;">2.0.18</td>
<td style="border:1px solid #ddd;padding:10px;">QR code generator for the Health Passport</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📹 @jitsi/react-sdk</td>
<td style="border:1px solid #ddd;padding:10px;">1.4.4</td>
<td style="border:1px solid #ddd;padding:10px;">Embeds Jitsi Meet video calls in the browser</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌍 i18next</td>
<td style="border:1px solid #ddd;padding:10px;">25.8.13</td>
<td style="border:1px solid #ddd;padding:10px;">Internationalization library</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌐 react-i18next</td>
<td style="border:1px solid #ddd;padding:10px;">16.5.4</td>
<td style="border:1px solid #ddd;padding:10px;">React bindings for i18next</td>
</tr>

</tbody>
</table>

<hr>

<h2 id="how-to-run-the-project-locally" style="color:#198754;">🚀 How to Run the Project Locally</h2>

<p>You need to run two separate servers — one for the backend, one for the frontend.</p>

<h3 style="color:#fd7e14;">🧰 Step 1 — Prerequisites</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Requirement</th>
<th style="border:1px solid #ddd;padding:10px;">Purpose</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🟢 Node.js (v18+)</td>
<td style="border:1px solid #ddd;padding:10px;">JavaScript runtime to run backend and build frontend</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📦 npm</td>
<td style="border:1px solid #ddd;padding:10px;">Package manager used to install dependencies</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🍃 MongoDB Atlas</td>
<td style="border:1px solid #ddd;padding:10px;">Cloud database for storing application data</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📧 Gmail with App Password</td>
<td style="border:1px solid #ddd;padding:10px;">Used by Nodemailer to send OTP and alerts</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">☁️ Cloudinary Account</td>
<td style="border:1px solid #ddd;padding:10px;">Stores uploaded images and documents</td>
</tr>

</tbody>
</table>

### Step 2 — Clone the repository

<code>
git clone https://github.com/amangupta9454/maacare.git
cd maacare
</code>

### Step 3 — Set up and start the Backend
<code>
cd BACKEND
npm install
</code>

Create a `.env` file inside `BACKEND/` with the following contents (fill in real values):

<code>
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/maacare
PORT=5000
JWT_SECRET=any_long_random_secret_string_here_32_chars_minimum
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
EMAIL_FROM=youremail@gmail.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecureAdminPassword123
ADMIN_NAME=Your Name
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
GETFORM_ENDPOINT=https://getform.io/f/your_form_endpoint
</code>

```bash
npm run dev
```

The backend will start at **http://localhost:5000**

### Step 4 — Set up and start the Frontend

Open a new terminal window:

```bash
cd FRONTEND
npm install
```

Create a `.env` file inside `FRONTEND/` with:

```env
VITE_GETFORM_ENDPOINT=your code
VITE_API_URL=https:localhost:5000/api
VITE_YOUTUBE_API_KEY=your youtube api key

```

```bash
npm run dev
```

The frontend will start at **http://localhost:5173**

### Step 5 — Create the Admin account (first time only)

```bash
cd BACKEND
npm run init-admin
```

This uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from `.env` to create the Admin user in MongoDB.

### Step 6 - Open the app

Go to **http://localhost:5173** in your browser. You can now register as a Mother, Doctor, ASHA Worker, or Hospital — or sign in with the Admin account you just created.

<hr>


<h2 id="environment-variables" style="color:#0d6efd;">🔑 Environment Variables</h2>

<h3 style="color:#6f42c1;">⚙️ Backend (<code>BACKEND/.env</code>)</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Variable</th>
<th style="border:1px solid #ddd;padding:10px;">Required</th>
<th style="border:1px solid #ddd;padding:10px;">What it does</th>
<th style="border:1px solid #ddd;padding:10px;">Where to get it</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>MONGO_URI</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">MongoDB connection string</td>
<td style="border:1px solid #ddd;padding:10px;">MongoDB Atlas → Connect → Connect your application</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>PORT</code></td>
<td style="border:1px solid #ddd;padding:10px;">❌ No</td>
<td style="border:1px solid #ddd;padding:10px;">Port the server runs on (default: 5000)</td>
<td style="border:1px solid #ddd;padding:10px;">Set to any free port</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>JWT_SECRET</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Signs and verifies JWT tokens</td>
<td style="border:1px solid #ddd;padding:10px;">Any random 32+ character string</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>EMAIL_USER</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Gmail address that sends emails</td>
<td style="border:1px solid #ddd;padding:10px;">Your Gmail address</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>EMAIL_PASS</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Gmail App Password (not your login password)</td>
<td style="border:1px solid #ddd;padding:10px;">https://myaccount.google.com/apppasswords</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>EMAIL_FROM</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">"From" address shown in sent emails</td>
<td style="border:1px solid #ddd;padding:10px;">Same as EMAIL_USER</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>CLOUDINARY_CLOUD_NAME</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Cloudinary account name</td>
<td style="border:1px solid #ddd;padding:10px;">https://cloudinary.com → Dashboard</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>CLOUDINARY_API_KEY</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Cloudinary API key</td>
<td style="border:1px solid #ddd;padding:10px;">https://cloudinary.com → Dashboard</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>CLOUDINARY_API_SECRET</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Cloudinary API secret</td>
<td style="border:1px solid #ddd;padding:10px;">https://cloudinary.com → Dashboard</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>FRONTEND_URL</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Frontend URL for CORS whitelist</td>
<td style="border:1px solid #ddd;padding:10px;"><code>http://localhost:5173</code> (dev) or Netlify URL (prod)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>ADMIN_EMAIL</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Email for the admin account (used by initAdmin.js)</td>
<td style="border:1px solid #ddd;padding:10px;">Choose your own</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>ADMIN_PASSWORD</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Password for the admin account</td>
<td style="border:1px solid #ddd;padding:10px;">Choose a strong password</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>ADMIN_NAME</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Display name for admin</td>
<td style="border:1px solid #ddd;padding:10px;">Choose your own</td>
</tr>



</tbody>
</table>

<br>

<h3 style="color:#6f42c1;">🎨 Frontend (<code>FRONTEND/.env</code>)</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Variable</th>
<th style="border:1px solid #ddd;padding:10px;">Required</th>
<th style="border:1px solid #ddd;padding:10px;">What it does</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>VITE_API_URL</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">
Base URL for all API calls. Must end with <code>/api</code>.
Example: <code>http://localhost:5000/api</code>
</td>
</tr>
<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>YOUTUBE_API_KEY</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Fetches videos for the Education page</td>
<td style="border:1px solid #ddd;padding:10px;">https://console.developers.google.com</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>GETFORM_ENDPOINT</code></td>
<td style="border:1px solid #ddd;padding:10px;">✅ Yes</td>
<td style="border:1px solid #ddd;padding:10px;">Receives contact form submissions</td>
<td style="border:1px solid #ddd;padding:10px;">https://getform.io</td>
</tr>

</tbody>
</table>

<hr>
<h2 id="all-api-routes-summary" style="color:#0d6efd;">🌐 All API Routes (Summary)</h2>

<p>Every route starts with <code>/api</code>. Full documentation is in <code>BACKEND/README.md</code>.</p>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Route Prefix</th>
<th style="border:1px solid #ddd;padding:10px;">What it handles</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/auth</code></td>
<td style="border:1px solid #ddd;padding:10px;">🔐 Register, login, OTP, password reset</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/doctors</code></td>
<td style="border:1px solid #ddd;padding:10px;">👨‍⚕️ Doctor profiles and search</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/appointments</code></td>
<td style="border:1px solid #ddd;padding:10px;">📅 Book and manage appointments</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/pregnancy</code></td>
<td style="border:1px solid #ddd;padding:10px;">🤰 Pregnancy profile and tracking</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/baby</code></td>
<td style="border:1px solid #ddd;padding:10px;">👶 Baby profile and milestones</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/baby-vaccines</code></td>
<td style="border:1px solid #ddd;padding:10px;">💉 Vaccination schedules</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/teleconsult</code></td>
<td style="border:1px solid #ddd;padding:10px;">📹 Video consultation booking and rooms</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/reviews</code></td>
<td style="border:1px solid #ddd;padding:10px;">⭐ Doctor reviews and ratings</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/forum</code></td>
<td style="border:1px solid #ddd;padding:10px;">💬 Community forum posts and comments</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/diet</code></td>
<td style="border:1px solid #ddd;padding:10px;">🥗 Daily diet plans</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/chat</code></td>
<td style="border:1px solid #ddd;padding:10px;">🌍 Real-time multilingual chat</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/quiz</code></td>
<td style="border:1px solid #ddd;padding:10px;">🧠 Maternal health quiz</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/feedback</code></td>
<td style="border:1px solid #ddd;padding:10px;">📝 Platform feedback submission</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/schemes</code></td>
<td style="border:1px solid #ddd;padding:10px;">🏛️ Government welfare schemes</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/analytics</code></td>
<td style="border:1px solid #ddd;padding:10px;">📊 Admin platform statistics</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/insights</code></td>
<td style="border:1px solid #ddd;padding:10px;">📈 Detailed admin insights</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/asha</code></td>
<td style="border:1px solid #ddd;padding:10px;">🧑‍⚕️ ASHA worker operations</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/health-records</code></td>
<td style="border:1px solid #ddd;padding:10px;">📂 Health record upload and view</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/hospitals</code></td>
<td style="border:1px solid #ddd;padding:10px;">🏥 Hospital listing and registration</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/hospital-bookings</code></td>
<td style="border:1px solid #ddd;padding:10px;">📋 Service booking and approval</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/mentors</code></td>
<td style="border:1px solid #ddd;padding:10px;">🤝 Mentor mothers program</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/insurance</code></td>
<td style="border:1px solid #ddd;padding:10px;">🛡️ Insurance policy management</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/health-passport</code></td>
<td style="border:1px solid #ddd;padding:10px;">📇 Digital health passport</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/navigation</code></td>
<td style="border:1px solid #ddd;padding:10px;">🧭 Step-by-step health navigation</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>/api/emergency</code></td>
<td style="border:1px solid #ddd;padding:10px;">🚨 SOS alerts and emergency contacts</td>
</tr>

</tbody>
</table>

<hr>

<h2 id="user-roles-and-permissions" style="color:#198754;">👥 User Roles and Permissions</h2>

<p>There are <b>5 roles</b> in the system. The role is chosen at registration and is embedded in the JWT token.</p>

<table style="border-collapse:collapse;width:100%;text-align:center;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Feature</th>
<th style="border:1px solid #ddd;padding:10px;">🤱 Mother</th>
<th style="border:1px solid #ddd;padding:10px;">👨‍⚕️ Doctor</th>
<th style="border:1px solid #ddd;padding:10px;">🧑‍⚕️ ASHA</th>
<th style="border:1px solid #ddd;padding:10px;">🏥 Hospital</th>
<th style="border:1px solid #ddd;padding:10px;">🛠️ Admin</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Register / Login</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">(created via script)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Health Dashboard</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Book Appointment</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Manage Insurance</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Health Passport</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Emergency SOS</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Book Hospital Service</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Doctor Panel</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Teleconsult</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">ASHA Panel</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Hospital Dashboard</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Approve Bookings</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Admin Panel</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">Platform Analytics</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">❌</td>
<td style="border:1px solid #ddd;padding:10px;">✔️</td>
</tr>

</tbody>
</table>
<hr>

<h2 id="how-each-major-feature-works" style="color:#0d6efd;">🧠 How Each Major Feature Works</h2>

<h3 style="color:#6f42c1;">🏥 Hospital Booking Flow</h3>
<p align="center">
  <img src="https://res.cloudinary.com/dgtyqhtor/image/upload/v1772701091/hospital_booking_flow_zbnyws.png" alt="Hospital Booking Flow Diagram" width="100%">
</p>

<h3 style="color:#6f42c1;">🛡️ Insurance at Booking</h3>
<li>
When a user opens the <b>Hospital Booking Form</b>, the frontend loads all of their saved insurance policies 
from the backend and shows them in a dropdown. When a policy is selected, the estimated cost is calculated automatically. 
The selected policy ID and cost are saved with the booking record.
</li>

<h3 style="color:#6f42c1;">📇 Digital Health Passport + QR</h3>

<p align="center">
  <img src="https://res.cloudinary.com/dgtyqhtor/image/upload/v1772701092/health_passport_qr_wwurj5.png" alt="Digital Health Passport generation" width="100%">
</p>

<li>
The user fills in their blood type, allergies, chronic conditions, doctor name and contact, and insurance provider. 
This is saved in MongoDB as a <code>HealthPassport</code> document.
</li>

<p>
On the frontend, <code>react-qr-code</code> converts the passport data into a QR code image. 
Any first responder can scan this QR with a phone and instantly see the patient's critical medical data — 
without needing internet access to a database.
</p>

<h3 style="color:#6f42c1;">🚨 Emergency SOS</h3>

<p align="center">
  <img src="https://res.cloudinary.com/dgtyqhtor/image/upload/v1772701093/sos_flow_knjdja.png" alt="Emergency SOS Activation Flow" width="100%">
</p>

<li>
The user taps the SOS button. The browser asks for location permission via <code>navigator.geolocation</code>. 
The coordinates are sent to <code>POST /api/emergency/sos</code>.
</li>

<li>
The backend saves an <code>EmergencyEvent</code> in MongoDB, pulls the user's saved emergency contacts, 
and sends an email via Nodemailer. The email includes a Google Maps link to the user's exact coordinates.
</li>

<h3 style="color:#6f42c1;">🧭 Health Navigation Assistant</h3>
<li>
The user types a condition (e.g., <b>anemia</b> or <b>gestational diabetes</b>). 
The frontend calls <code>GET /api/navigation/journey?condition=anemia</code>.
</li>

<li>
The <code>healthJourneyGenerator.js</code> utility matches the condition and returns an ordered array of steps 
(visit ASHA worker, go for blood test, see gynecologist, etc.). Each step has a title, description, type, and icon.
</li>

<h3 style="color:#6f42c1;">💬 Real-Time Chat</h3>
<li>
Both sender and receiver connect to the backend <b>Socket.IO</b> server when they open the chat page. 
When A sends a message, the POST request saves it to MongoDB.
</li>

<li>
The backend also calls 
<code>io.to(receiverSocketId).emit('receive_message', data)</code>.
The receiver's browser receives this event and appends the message to their chat window instantly.
</li>

<h3 style="color:#6f42c1;">📹 Teleconsultation</h3>
<li>
The user books a session via the API. The backend creates a <code>TeleConsult</code> record with a unique 
<code>sessionId</code>.
</li>

<li>
Both the mother and doctor navigate to 
<code>/teleconsult/room/:consultId</code>.
</li>

<li>
The <code>TeleConsultRoom</code> component uses <code>@jitsi/react-sdk</code> to embed a 
<b>Jitsi Meet</b> room named <code>maacare_&lt;sessionId&gt;</code>. 
Both users join the same room and can video call directly in the browser.
</li>

<hr>

<h2 id="deployment" style="color:#198754;">🚀 Deployment</h2>

<h3 style="color:#fd7e14;">🌐 Frontend — Netlify</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Step</th>
<th style="border:1px solid #ddd;padding:10px;">Action</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">1</td>
<td style="border:1px solid #ddd;padding:10px;">Push code to GitHub</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">2</td>
<td style="border:1px solid #ddd;padding:10px;">Go to netlify.com → New Site → Connect GitHub repo</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">3</td>
<td style="border:1px solid #ddd;padding:10px;">Set <b>Base directory</b> to <code>FRONTEND</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">4</td>
<td style="border:1px solid #ddd;padding:10px;">Set <b>Build command</b> to <code>npm run build</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">5</td>
<td style="border:1px solid #ddd;padding:10px;">Set <b>Publish directory</b> to <code>FRONTEND/dist</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">6</td>
<td style="border:1px solid #ddd;padding:10px;">Add environment variable: <code>VITE_API_URL = https://your-backend.com/api</code>
<code>VITE_GETFORM_ENDPOINT</code> , <code>VITE_YOUTUBE_API_KEY</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">7</td>
<td style="border:1px solid #ddd;padding:10px;">Deploy</td>
</tr>

</tbody>
</table>

<p>
The <code>netlify.toml</code> in the <b>FRONTEND</b> folder already handles SPA routing.
</p>

<h3 style="color:#fd7e14;">🖥️ Backend — Any Node.js Host (Render, Railway, etc.)</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Step</th>
<th style="border:1px solid #ddd;padding:10px;">Action</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">1</td>
<td style="border:1px solid #ddd;padding:10px;">Push code to GitHub</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">2</td>
<td style="border:1px solid #ddd;padding:10px;">Create a new Web Service on Render (or similar)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">3</td>
<td style="border:1px solid #ddd;padding:10px;">Set root directory to <code>BACKEND</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">4</td>
<td style="border:1px solid #ddd;padding:10px;">Set start command to <code>node index.js</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">5</td>
<td style="border:1px solid #ddd;padding:10px;">Add all backend environment variables in the hosting dashboard</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">6</td>
<td style="border:1px solid #ddd;padding:10px;">After deploying, copy the backend URL and set it as <code>VITE_API_URL</code> in Netlify</td>
</tr>

</tbody>
</table>
<hr>

<h2 id="package-dependencies" style="color:#0d6efd;">📦 Package Dependencies</h2>

<h3 style="color:#6f42c1;">⚙️ Backend — Key Packages</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Package</th>
<th style="border:1px solid #ddd;padding:10px;">Version</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🚏 express</td>
<td style="border:1px solid #ddd;padding:10px;">^5.2.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🍃 mongoose</td>
<td style="border:1px solid #ddd;padding:10px;">^9.2.3</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔒 bcrypt</td>
<td style="border:1px solid #ddd;padding:10px;">^6.0.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔑 jsonwebtoken</td>
<td style="border:1px solid #ddd;padding:10px;">^9.0.3</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📧 nodemailer</td>
<td style="border:1px solid #ddd;padding:10px;">^8.0.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">☁️ cloudinary</td>
<td style="border:1px solid #ddd;padding:10px;">^2.9.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📤 multer</td>
<td style="border:1px solid #ddd;padding:10px;">^2.1.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔌 socket.io</td>
<td style="border:1px solid #ddd;padding:10px;">^4.8.3</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⏰ node-cron</td>
<td style="border:1px solid #ddd;padding:10px;">^4.2.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌍 google-translate-api-x</td>
<td style="border:1px solid #ddd;padding:10px;">^10.7.2</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🛡️ helmet</td>
<td style="border:1px solid #ddd;padding:10px;">^8.1.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔗 cors</td>
<td style="border:1px solid #ddd;padding:10px;">^2.8.6</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚙️ dotenv</td>
<td style="border:1px solid #ddd;padding:10px;">^17.3.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔄 nodemon (dev)</td>
<td style="border:1px solid #ddd;padding:10px;">^3.1.14</td>
</tr>

</tbody>
</table>

<br>

<h3 style="color:#6f42c1;">🎨 Frontend — Key Packages</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Package</th>
<th style="border:1px solid #ddd;padding:10px;">Version</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚛️ react</td>
<td style="border:1px solid #ddd;padding:10px;">^19.2.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚛️ react-dom</td>
<td style="border:1px solid #ddd;padding:10px;">^19.2.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🧭 react-router-dom</td>
<td style="border:1px solid #ddd;padding:10px;">^7.13.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌐 axios</td>
<td style="border:1px solid #ddd;padding:10px;">^1.13.6</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎨 tailwindcss</td>
<td style="border:1px solid #ddd;padding:10px;">^4.2.1</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎞️ framer-motion</td>
<td style="border:1px solid #ddd;padding:10px;">^12.34.4</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🎯 lucide-react</td>
<td style="border:1px solid #ddd;padding:10px;">^0.576.0</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🔌 socket.io-client</td>
<td style="border:1px solid #ddd;padding:10px;">^4.8.3</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📷 react-qr-code</td>
<td style="border:1px solid #ddd;padding:10px;">^2.0.18</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">📹 @jitsi/react-sdk</td>
<td style="border:1px solid #ddd;padding:10px;">^1.4.4</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌍 i18next</td>
<td style="border:1px solid #ddd;padding:10px;">^25.8.13</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">🌐 react-i18next</td>
<td style="border:1px solid #ddd;padding:10px;">^16.5.4</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;">⚡ vite (dev)</td>
<td style="border:1px solid #ddd;padding:10px;">^7.3.1</td>
</tr>

</tbody>
</table>

<hr>

<h2 id="available-scripts" style="color:#198754;">📜 Available Scripts</h2>

<h3 style="color:#fd7e14;">🖥️ Backend (<code>cd BACKEND</code>)</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Command</th>
<th style="border:1px solid #ddd;padding:10px;">What it does</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run dev</code></td>
<td style="border:1px solid #ddd;padding:10px;">🔄 Start with nodemon (auto-restarts on file changes)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm start</code></td>
<td style="border:1px solid #ddd;padding:10px;">🚀 Start normally for production</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run init-admin</code></td>
<td style="border:1px solid #ddd;padding:10px;">👑 Create the first admin user from <code>.env</code> values</td>
</tr>

</tbody>
</table>

<br>

<h3 style="color:#fd7e14;">🌐 Frontend (<code>cd FRONTEND</code>)</h3>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<thead>
<tr style="background:#f8f9fa;">
<th style="border:1px solid #ddd;padding:10px;">Command</th>
<th style="border:1px solid #ddd;padding:10px;">What it does</th>
</tr>
</thead>

<tbody>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run dev</code></td>
<td style="border:1px solid #ddd;padding:10px;">⚡ Start Vite dev server on <code>http://localhost:5173</code></td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run build</code></td>
<td style="border:1px solid #ddd;padding:10px;">📦 Build for production (output goes to <code>dist/</code>)</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run preview</code></td>
<td style="border:1px solid #ddd;padding:10px;">👀 Preview the production build locally</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:10px;"><code>npm run lint</code></td>
<td style="border:1px solid #ddd;padding:10px;">🧹 Run ESLint to check for code issues</td>
</tr>

</tbody>
</table>
<hr>

<h2 id="contact" style="color:#0d6efd;">📬 Contact</h2>

<div style="border:1px solid #d0d7de;padding:25px;border-radius:12px;background-color:#f6f8fa;max-width:750px;">

<h3 style="margin-top:0;color:#6f42c1;">👨‍💻 Aman Gupta</h3>

<p style="font-size:15px;">
<b>Full-Stack Developer</b> | MERN Stack | AI-Powered Web Applications
</p>

<p>
Passionate about building scalable full-stack platforms and AI-powered applications that solve real-world problems.
Creator of <b>MaaCare</b>, a maternal healthcare platform connecting mothers, doctors, hospitals, and ASHA workers through technology.
</p>

<br>

<h4 style="color:#198754;">🌐 Connect With Me</h4>

<table style="border-collapse:collapse;width:100%;text-align:left;">
<tbody>

<tr>
<td style="padding:8px;font-weight:bold;">📧 Email</td>
<td style="padding:8px;">
<a href="mailto:ag0567688@gmail.com">ag0567688@gmail.com</a>
</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">💼 LinkedIn</td>
<td style="padding:8px;">
<a href="https://linkedin.com/in/amangupta9454">linkedin.com/in/amangupta9454</a>
</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">🐙 GitHub</td>
<td style="padding:8px;">
<a href="https://github.com/amangupta9454">github.com/amangupta9454</a>
</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">🌐 Portfolio</td>
<td style="padding:8px;">
<a href="http://gupta-aman-portfolio.netlify.app/">gupta-aman-portfolio.netlify.app</a>
</td>
</tr>

</tbody>
</table>

<br>

<h4 style="color:#fd7e14;">🚀 Open For</h4>

<ul>
<li>💡 Innovative healthcare and AI projects</li>
<li>🤝 Open-source collaborations</li>
<li>🧑‍💻 Full-stack development opportunities</li>
<li>📊 Hackathons and technical competitions</li>
</ul>

<p style="margin-top:15px;">
If you have questions, collaboration ideas, or feedback about <b>MaaCare</b>, feel free to reach out.
Let's build impactful technology together! 🚀
</p>

</div>