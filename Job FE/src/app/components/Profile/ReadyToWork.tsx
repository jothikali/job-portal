import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Briefcase, Bookmark, Bell, ChevronRight
} from 'lucide-react';
import ProfileMenu from '../../pages/ProfileDropdown';
import { toast } from '../../lib/toast';

const ReadyToWork = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    const navigate = useNavigate();
    const userId = 123; // Inga dynamic userId use pannunga

    // Initial Load: Database-la irundhu status-ai fetch pannum
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/jobs/get-preferences/${userId}`);
                if (res.data && res.data.ready_to_work !== undefined) {
                    setIsAvailable(!!res.data.ready_to_work);
                }
            } catch (err) {
                console.error("Error fetching status:", err);
            }
        };
        fetchStatus();
    }, []);

    // Save Logic
    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/jobs/save-ready-status', {
                userId: 123,
                readyToWork: isAvailable
            });
            toast.success("Availability status saved!");
            navigate(-1);
        } catch (err) {
            console.error("Save failed:", err);
            toast.error("Failed to save status.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
            {/* --- 1. FIXED NAVBAR --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                            <Briefcase className="size-6 text-[#0F172A]" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-white">JobPortal</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-10 text-[16px] font-bold">
                        <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                        <Link to="/reviews" className="text-slate-300 hover:text-white transition-colors">Company reviews</Link>
                    </div>
                </div>

                <div className="flex items-center gap-8 font-bold text-sm">
                    <div className="flex items-center gap-6">
                        <Link to="/my-jobs" className="text-slate-300 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 relative group">
                            <Bookmark size={22} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">My jobs</span>
                        </Link>
                        <button className="text-slate-300 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 relative group">
                            <Bell size={22} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Notifications</span>
                        </button>
                        <div className="flex items-center">
                            <ProfileMenu />
                        </div>
                    </div>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <Link to="/login?redirect=/post-job" className="text-slate-300 hover:text-white transition-colors">Employers | Post Job</Link>
                </div>
            </nav>

            {/* --- 2. MAIN CONTENT --- */}
            <main className="pt-32 max-w-[650px] mx-auto px-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#2557a7] font-bold mb-8 hover:underline group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
                    <h1 className="text-[32px] font-black text-slate-900 mb-3">Ready to work</h1>
                    <p className="text-slate-500 text-[17px] mb-10 leading-relaxed">
                        Let employers know that you can begin work right away. This will be visible on your profile and to recruiters.
                    </p>

                    {/* Toggle Section */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100 mb-10">
                        <div className="flex flex-col">
                            <span className="font-bold text-[18px] text-slate-800">Immediate availability</span>
                            <span className="text-sm text-slate-500">I'm available to start immediately</span>
                        </div>

                        <button
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner ${isAvailable ? 'bg-[#2557a7]' : 'bg-slate-300'
                                }`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isAvailable ? 'left-8' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-8">
                        <button
                            onClick={handleSave}
                            className="px-10 py-3 bg-[#2557a7] text-white font-bold rounded-xl hover:bg-[#1c4485] transition-all active:scale-95 shadow-lg shadow-blue-200"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-10 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReadyToWork;