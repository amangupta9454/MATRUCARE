import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import {
    Menu, X, HeartPulse, LayoutDashboard, LogOut, LogIn, UserPlus,
    ChevronDown, Hospital, Stethoscope, Users, BookOpen, Shield,
    Fingerprint, Map, Phone, Star, Info, MessageSquare, AlarmCheck
} from 'lucide-react';

// ─── Dropdown Menu Component with Delay Buffer & Hitbox Bridge ──────────────────────────────
const DropdownMenu = ({ label, items, isActive }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 150); // 150ms buffer delay allows easy movement into menu items
    };

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div ref={ref} className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-sky-700 bg-sky-100/80 border border-sky-300/80 font-bold' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                    }`}
            >
                {label}
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 pt-1.5 w-60 z-[100] animate-in fade-in slide-in-from-top-2">
                    <div className="py-2 bg-white/95 border border-sky-200 rounded-2xl shadow-xl shadow-sky-900/10 backdrop-blur-xl">
                        {items.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-sky-700 hover:bg-sky-50/80 transition-colors group/item"
                            >
                                <span className="text-sky-500 group-hover/item:text-sky-700 transition-colors">{item.icon}</span>
                                <div>
                                    <p className="font-semibold leading-none mb-0.5">{item.name}</p>
                                    {item.desc && <p className="text-xs text-slate-400 group-hover/item:text-slate-500 leading-none">{item.desc}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Navbar ────────────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [mobileSection, setMobileSection] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const isActive = (...paths) => paths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    // ─── Nav Group Definitions ─────────────────────────────────────────────────
    const careItems = [
        { name: 'Hospitals', path: '/hospitals', icon: <Hospital size={16} />, desc: 'Find & book top hospitals' },
        { name: 'Doctors', path: '/doctors', icon: <Stethoscope size={16} />, desc: 'Connect with specialists' },
        { name: 'TeleConsult', path: '/teleconsult', icon: <AlarmCheck size={16} />, desc: 'Video consultations' },
        { name: 'Mentor Community', path: '/mentor-community', icon: <Users size={16} />, desc: 'Mother-to-mother support' },
    ];

    const healthItems = [
        { name: 'Health Dashboard', path: '/health-dashboard', icon: <LayoutDashboard size={16} />, desc: 'Pregnancy tracking & vitals' },
        { name: 'Health Records', path: '/health-records', icon: <BookOpen size={16} />, desc: 'Digital medical history' },
        { name: 'Baby Dashboard', path: '/baby-dashboard', icon: <HeartPulse size={16} />, desc: 'Track baby milestones' },
        { name: 'Health Passport', path: '/passport', icon: <Fingerprint size={16} />, desc: 'Portable medical identity' },
        { name: 'Insurance', path: '/insurance', icon: <Shield size={16} />, desc: 'Manage your policies' },
    ];

    const guideItems = [
        { name: 'Health Navigation', path: '/navigation', icon: <Map size={16} />, desc: 'Step-by-step health journeys' },
        { name: 'Education', path: '/education', icon: <BookOpen size={16} />, desc: 'Maternal health learning' },
        { name: 'Govt Schemes', path: '/schemes', icon: <Star size={16} />, desc: 'Welfare programs & benefits' },
        { name: 'Forum', path: '/forum', icon: <MessageSquare size={16} />, desc: 'Community discussions' },
    ];

    const mobileAllLinks = [
        { section: 'Care', items: careItems },
        { section: 'My Health', items: healthItems },
        { section: 'Explore', items: guideItems },
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-sky-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center gap-4">

                    {/* ── Logo ──────────────────────────────────────────── */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-200 group-hover:bg-sky-500/20 transition-colors">
                            <HeartPulse className="h-5 w-5 text-sky-600" />
                        </div>
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                            Matru<span className="text-sky-600">Care</span>
                        </span>
                    </Link>

                    {/* ── Desktop Nav ───────────────────────────────────── */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        <Link
                            to="/"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/') && location.pathname === '/' ? 'text-sky-700 bg-sky-100/80 border border-sky-300/80 font-bold' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                                }`}
                        >
                            Home
                        </Link>

                        <DropdownMenu
                            label="Care"
                            items={careItems}
                            isActive={isActive('/hospitals', '/doctors', '/teleconsult', '/mentor-community')}
                        />
                        <DropdownMenu
                            label="My Health"
                            items={healthItems}
                            isActive={isActive('/health-dashboard', '/health-records', '/baby-dashboard', '/passport', '/insurance')}
                        />
                        <DropdownMenu
                            label="Explore"
                            items={guideItems}
                            isActive={isActive('/navigation', '/education', '/schemes', '/forum')}
                        />

                        <Link
                            to="/reviews"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/reviews') ? 'text-sky-700 bg-sky-100/80 border border-sky-300/80 font-bold' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                                }`}
                        >
                            Reviews
                        </Link>
                        <Link
                            to="/contact"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/contact') ? 'text-sky-700 bg-sky-100/80 border border-sky-300/80 font-bold' : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
                                }`}
                        >
                            Contact
                        </Link>
                    </div>

                    {/* ── Desktop Auth ──────────────────────────────────── */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {user ? (
                            <>
                                <span className="text-xs text-slate-600 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full hidden xl:block font-medium">
                                    {user.name?.split(' ')[0]}
                                </span>
                                <Link
                                    to={`/dashboard/${user.role.toLowerCase()}`}
                                    className="flex items-center gap-1.5 border border-sky-300 text-sky-700 hover:bg-sky-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs"
                                >
                                    <LayoutDashboard size={14} /> Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                                >
                                    <LogOut size={14} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="flex items-center gap-1.5 text-slate-700 hover:text-sky-700 text-sm font-medium transition-colors px-3.5 py-2 rounded-lg hover:bg-sky-50">
                                    <LogIn size={14} /> Login
                                </Link>
                                <Link to="/register" className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-sky-500/20 transition-all">
                                    <UserPlus size={14} /> Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile Toggle ─────────────────────────────────── */}
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-700 hover:text-sky-600 p-2 rounded-lg hover:bg-sky-50 transition-colors">
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* ─── Mobile Menu ──────────────────────────────────────────────── */}
            {isOpen && (
                <div className="lg:hidden border-t border-sky-200 bg-white/95 backdrop-blur-2xl max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-4 space-y-1">

                        {/* Home */}
                        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors">
                            Home
                        </Link>

                        {/* Grouped sections */}
                        {mobileAllLinks.map(({ section, items }) => (
                            <div key={section}>
                                <button
                                    onClick={() => setMobileSection(mobileSection === section ? null : section)}
                                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-sky-50 transition-colors"
                                >
                                    {section}
                                    <ChevronDown size={14} className={`transition-transform ${mobileSection === section ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileSection === section && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-sky-200 pl-3">
                                        {items.map(item => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => { setIsOpen(false); setMobileSection(null); }}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                                            >
                                                <span className="text-sky-600">{item.icon}</span>{item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link to="/reviews" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors">
                            <Star size={16} className="text-sky-600" /> Reviews
                        </Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors">
                            <Phone size={16} className="text-sky-600" /> Contact
                        </Link>

                        {/* Auth */}
                        <div className="pt-3 border-t border-sky-200 space-y-2">
                            {user ? (
                                <>
                                    <Link to={`/dashboard/${user.role.toLowerCase()}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200">
                                        <LayoutDashboard size={15} /> Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                        <LogOut size={15} /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 border border-sky-300 text-sky-700 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/20">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
