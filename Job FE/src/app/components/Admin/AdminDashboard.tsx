import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Users, Briefcase, BarChart3, Search, Bell, LogOut, Settings, Award } from 'lucide-react';
import PostJob from '../../pages/PostJob';
import ManageJobs from './ManageJobs';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const location = useLocation();
    const navigate = useNavigate();

    // Route checks
    const currentPath = location.pathname;

    const isApplicationsRoute = location.pathname === '/admin/applications';
    const isReviewRoute = location.pathname === '/admin/review';
    const isJobsRoute = location.pathname === '/admin/jobs';

    const [stats, setStats] = useState({ totalJobs: 0, applicants: 0, pending: 0 });

    useEffect(() => {
        fetch('http://localhost:5000/api/jobs/stats')
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setStats({
                    totalJobs: data.totalJobs || 0,
                    applicants: data.applicants || 0,
                    pending: data.pending || 0
                });
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'overview') navigate('/admin');
        else if (tab === 'post-job') navigate('/admin/post-job');
        else if (tab === 'applications') navigate('/admin/applications');
        else if (tab === 'jobs') navigate('/admin/jobs');
        else if (tab === 'review') navigate('/admin/review'); // Intha line-ai add pannunga
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* --- SIDEBAR --- */}
            <div className="w-72 bg-[#0F172A] p-6 text-white flex flex-col sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Briefcase size={22} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter italic">JOB PORTAL</h2>
                </div>

                <nav className="space-y-2 flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4 px-3">Main Menu</p>

                    {/* 1. Overview */}
                    <button
                        onClick={() => navigate('/admin')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${location.pathname === '/admin'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <BarChart3 size={20} /> <span className="font-bold text-sm">Overview</span>
                    </button>

                    {/* 2. Post a Job */}
                    <button
                        onClick={() => navigate('/admin/post-job')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${location.pathname === '/admin/post-job'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <PlusCircle size={20} /> <span className="font-bold text-sm">Post a Job</span>
                    </button>

                    {/* 3. Applications */}
                    <button
                        onClick={() => navigate('/admin/applications')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${location.pathname === '/admin/applications'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <Users size={20} /> <span className="font-bold text-sm">Applications</span>
                    </button>

                    {/* 4. Manage Jobs */}
                    <button
                        onClick={() => navigate('/admin/jobs')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 mt-4 border border-slate-800/50 ${location.pathname === '/admin/jobs'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <Briefcase size={20} /> <span className="font-bold text-sm">Manage Jobs</span>
                    </button>

                    {/* 5. Admin Review */}
                    <button
                        onClick={() => navigate('/admin/review')}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 mt-2 border border-slate-800/50 ${location.pathname === '/admin/review'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <Award size={20} />
                        <span className="font-bold text-sm">Admin Review</span>
                    </button>
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 p-3.5 text-slate-400 hover:text-red-400 transition-colors">
                        <LogOut size={20} /> <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 w-[400px] focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search jobs, candidates..."
                            className="bg-transparent outline-none text-sm font-medium w-full text-slate-600"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative">
                                <Bell size={22} />
                                <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <Settings size={22} />
                            </button>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-tight">Jothi Kaliraj</p>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Super Admin</p>
                            </div>
                            <div className="size-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black">
                                JK
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {/* THE FIX: Show Outlet for both jobs and applications routes */}
                        {(isJobsRoute || isApplicationsRoute || isReviewRoute) ? (
                            <div className="animate-in fade-in duration-500">
                                <Outlet />
                            </div>
                        ) : (
                            <>
                                {/* Inga thaan unga Overview (Total Jobs, Applicants) stats irukkum */}
                                <div className="mb-10">
                                    <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
                                        {activeTab.replace('-', ' ')}
                                    </h1>
                                    <p className="text-slate-500 font-medium mt-1">Manage platform performance.</p>
                                </div>
                                {activeTab === 'overview' && (
                                    <div className="animate-in fade-in duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                                <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                                    <Briefcase className="text-blue-600" size={24} />
                                                </div>
                                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Total Jobs</p>
                                                <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.totalJobs}</h3>
                                            </div>

                                            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                                <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                                                    <Users className="text-emerald-600" size={24} />
                                                </div>
                                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Applicants</p>
                                                <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.applicants}</h3>
                                            </div>

                                            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                                <div className="size-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                                                    <BarChart3 className="text-orange-600" size={24} />
                                                </div>
                                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Pending</p>
                                                <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.pending}</h3>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'post-job' && (
                                    <div className="bg-white p-10 rounded-[40px] border border-slate-100">
                                        <PostJob />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;