import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Menu, X, HeartPulse, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hospitals', path: '/hospitals' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'Mentors', path: '/mentor-community' },
        { name: 'Records', path: '/health-records' },
        { name: 'Academy', path: '/education' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Chat', path: '/chat' },
        { name: 'About', path: '/about' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="bg-teal-500/20 p-2 rounded-xl border border-teal-500/30 group-hover:bg-teal-500/30 transition-colors">
                            <HeartPulse className="h-5 w-5 text-teal-400" />
                        </div>
                        <span className="font-extrabold text-xl text-white tracking-tight">
                            Matru<span className="text-teal-400">Care</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                                    ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    to={`/dashboard/${user.role.toLowerCase()}`}
                                    className="flex items-center gap-2 border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                >
                                    <LayoutDashboard size={15} /> Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                                >
                                    <LogOut size={15} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                                    <LogIn size={15} /> Login
                                </Link>
                                <Link to="/register" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20 transition-all">
                                    <UserPlus size={15} /> Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(link.path)
                                    ? 'text-teal-400 bg-teal-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-white/10 space-y-2">
                            {user ? (
                                <>
                                    <Link to={`/dashboard/${user.role.toLowerCase()}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20">
                                        <LayoutDashboard size={15} /> Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                                        <LogOut size={15} /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-semibold hover:bg-teal-500/10 transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all">
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
