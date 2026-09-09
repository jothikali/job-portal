import { API } from '../../lib/api';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Users, Briefcase, BarChart3, Search, Bell, LogOut, Settings, Award, Menu, X, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import PostJob from '../../pages/PostJob';
import ManageJobs from './ManageJobs';
import { InstallNavButton } from '../InstallBanner';

const AdminDashboard = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode]       = useState(() => localStorage.getItem('adminDark') === 'true');
    const [analytics, setAnalytics]     = useState<any>(null);

    const toggleDark = () => {
        setDarkMode(d => {
            localStorage.setItem('adminDark', String(!d));
            return !d;
        });
    };

    const currentPath        = location.pathname;
    const isApplicationsRoute = currentPath === '/admin/applications';
    const isReviewRoute       = currentPath === '/admin/review';
    const isJobsRoute         = currentPath === '/admin/jobs';

    const [stats, setStats] = useState({ totalJobs: 0, applicants: 0, pending: 0 });

    useEffect(() => {
        fetch(`${API}/jobs/stats`)
            .then(res => { if (!res.ok) throw new Error("not ok"); return res.json(); })
            .then(data => setStats({ totalJobs: data.totalJobs || 0, applicants: data.applicants || 0, pending: data.pending || 0 }))
            .catch(err => console.error("Fetch error:", err));

        // Fetch analytics for overview charts
        fetch(`${API}/admin/analytics`)
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setAnalytics(data); })
            .catch(() => {});
    }, []);

    const navTo = (path: string) => { navigate(path); setSidebarOpen(false); };

    // ── Logout ──
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin',              icon: <BarChart3 size={20} />,  label: 'Overview'      },
        { path: '/admin/post-job',     icon: <PlusCircle size={20} />, label: 'Post a Job'    },
        { path: '/admin/applications', icon: <Users size={20} />,      label: 'Applications'  },
        { path: '/admin/jobs',         icon: <Briefcase size={20} />,  label: 'Manage Jobs'   },
        { path: '/admin/review',       icon: <Award size={20} />,      label: 'Admin Review'  },
    ];

    const Sidebar = () => (
        <nav className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 mb-10 px-2">
                <div className="flex items-center gap-2.5">
                    <img src="/icons/job-logo.jpeg" alt="Job Nest"
                         className="h-9 w-9 object-contain rounded-xl shadow-lg shadow-blue-500/20 shrink-0" />
                    <h2 className="text-xl font-black tracking-tighter italic text-white">JOB NEST</h2>
                </div>
                {/* Close button for mobile drawer */}
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-2 flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4 px-3">Main Menu</p>
                {navItems.map(item => (
                    <button
                        key={item.path}
                        onClick={() => navTo(item.path)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${
                            currentPath === item.path
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        <span className="font-bold text-sm">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                    <LogOut size={20} /> <span className="font-bold text-sm">Logout</span>
                </button>
            </div>
        </nav>
    );

    return (
        <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`}>

            {/* ── DESKTOP SIDEBAR — fixed height, never scrolls ─────────── */}
            <div className="hidden lg:flex w-72 bg-[#0F172A] p-6 text-white flex-col h-screen shrink-0 overflow-y-auto">
                <Sidebar />
            </div>

            {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[200] flex lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    {/* Drawer */}
                    <div className="relative z-10 w-72 bg-[#0F172A] p-6 text-white flex flex-col h-full animate-in slide-in-from-left duration-300">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT — scrolls independently from sidebar ───── */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-10 shrink-0">
                    {/* Hamburger (mobile only) */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Search bar — hidden on small screens */}
                    <div className="hidden md:flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 w-[340px] focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search jobs, candidates..."
                            className="bg-transparent outline-none text-sm font-medium w-full text-slate-600"
                        />
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-1 md:gap-2">
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <button className="hidden sm:block p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <Settings size={20} />
                            </button>
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDark}
                                className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                title="Toggle dark mode"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <InstallNavButton />
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-slate-100" />
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 leading-tight">Jothi Kaliraj</p>
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Super Admin</p>
                            </div>
                            <div className="size-9 md:size-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-sm">
                                JK
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-slate-900' : ''}`}>
                    <div className="max-w-6xl mx-auto">
                        {(isJobsRoute || isApplicationsRoute || isReviewRoute) ? (
                            <div className="animate-in fade-in duration-500">
                                <Outlet />
                            </div>
                        ) : currentPath === '/admin/post-job' ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="mb-6 md:mb-10">
                                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Post a Job</h1>
                                    <p className={`font-medium mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Create a new job listing.</p>
                                </div>
                                <div className={`p-4 md:p-10 rounded-[28px] md:rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                    <PostJob />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 md:mb-10">
                                    <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Overview</h1>
                                    <p className={`font-medium mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage platform performance.</p>
                                </div>
                                <div className="animate-in fade-in duration-500 space-y-8">
                                    {/* Stats cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
                                        {[
                                            { label: 'Total Jobs',  value: stats.totalJobs,  icon: <Briefcase className="text-blue-600"   size={22} />, bg: 'bg-blue-50'   },
                                            { label: 'Applicants',  value: stats.applicants, icon: <Users     className="text-emerald-600" size={22} />, bg: 'bg-emerald-50'},
                                            { label: 'Pending',     value: stats.pending,    icon: <BarChart3 className="text-orange-600" size={22} />, bg: 'bg-orange-50' },
                                        ].map(card => (
                                            <div key={card.label} className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                <div className={`size-10 md:size-12 ${card.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
                                                    {card.icon}
                                                </div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{card.label}</p>
                                                <h3 className={`text-3xl md:text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</h3>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Analytics Charts */}
                                    {analytics && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Applications per Job */}
                                            {analytics.perJob?.length > 0 && (
                                                <div className={`p-6 rounded-[24px] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        Applications per Job
                                                    </h4>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <BarChart data={analytics.perJob} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                                            <XAxis dataKey="job" tick={{ fontSize: 10, fill: darkMode ? '#94A3B8' : '#64748B' }}
                                                                tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                                                            <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94A3B8' : '#64748B' }} />
                                                            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: darkMode ? '#1E293B' : '#fff', border: 'none', color: darkMode ? '#fff' : '#0F172A' }} />
                                                            <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}

                                            {/* Stage distribution pie */}
                                            {analytics.byStage?.length > 0 && (
                                                <div className={`p-6 rounded-[24px] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        Stage Distribution
                                                    </h4>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie data={analytics.byStage} dataKey="count" nameKey="stage"
                                                                cx="50%" cy="50%" outerRadius={70} label={({ stage, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                                labelLine={false} fontSize={10}>
                                                                {analytics.byStage.map((_: any, i: number) => (
                                                                    <Cell key={i} fill={['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'][i % 6]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                                                            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}

                                            {/* Applications over 30 days */}
                                            {analytics.overTime?.length > 0 && (
                                                <div className={`lg:col-span-2 p-6 rounded-[24px] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        Applications — Last 30 Days
                                                    </h4>
                                                    <ResponsiveContainer width="100%" height={160}>
                                                        <BarChart data={analytics.overTime} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: darkMode ? '#94A3B8' : '#64748B' }}
                                                                tickFormatter={(v) => v?.slice(5)} />
                                                            <YAxis tick={{ fontSize: 9, fill: darkMode ? '#94A3B8' : '#64748B' }} />
                                                            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                                                            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
