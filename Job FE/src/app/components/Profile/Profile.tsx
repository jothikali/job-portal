import BrandLogo from '../BrandLogo';
import { API, UPLOADS } from '../../lib/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ProfileMenu from '../../pages/ProfileDropdown';
import { toast } from '../../lib/toast';
import {
    Edit3, FileText, Bookmark, Bell,
    Mail, Phone, MapPin, User,
    CheckCircle2, Loader2, CloudUpload, MoreVertical, Eye, Download, Trash2, ChevronRight
} from 'lucide-react';

export function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [isResumeMenuOpen, setIsResumeMenuOpen] = useState(false);

    // 1. Unified Fetch Function - Database data-va state-ku kondu varom
    // Profile.tsx kulla fetch function-ah matum replace pannunga

    const fetchProfileData = async () => {
        try {
            const storedUserRaw = localStorage.getItem('user');
            if (!storedUserRaw) {
                navigate('/login');
                return;
            }

            const storedUser = JSON.parse(storedUserRaw);

            // CRITICAL FIX: ID-ah 'Number' ah convert panni safe-ah yedukkarom
            // Sila time storedUser.user.id nu irukkum, sila time storedUser.id nu irukkum
            const rawId = storedUser.id || (storedUser.user && storedUser.user.id);

            // '2:1' maari junk characters varama irukka idhu dhaan correct way
            const userId = parseInt(rawId.toString().split(':')[0]);

            console.log("Fetching for Clean User ID:", userId);

            if (userId) {
                const response = await axios.get(`${API}/user/full-profile/${userId}`);

                if (response.data) {
                    setProfile(response.data);
                    // Update storage with fresh data
                    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...response.data }));
                }
            }
        } catch (error) {
            console.error("Fetch error details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    // Safety check function: string 'null' or empty-ah handle panna
    const hasData = (val: any) => val && val !== "null" && val !== "";

    // --- Resume Handlers ---
    const handleView = () => {
        if (profile?.resume_url) {
            window.open(`${UPLOADS}/resumes/${profile.resume_url}`, '_blank');
        }
        setIsResumeMenuOpen(false);
    };

    const handleDownload = () => {
        if (profile?.resume_url) {
            const link = document.createElement('a');
            link.href = `${UPLOADS}/resumes/${profile.resume_url}`;
            link.setAttribute('download', profile.resume_url);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsResumeMenuOpen(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your resume?")) return;
        try {
            const userId = profile?.userId || profile?.id;
            await axios.delete(`${API}/user/delete-resume/${userId}`);
            fetchProfileData();
        } catch (error) { console.error(error); }
        setIsResumeMenuOpen(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = storedUser.id || storedUser.user?.id;

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('userId', userId);

        try {
            setUploading(true);
            await axios.post(`${API}/user/upload-resume`, formData);
            fetchProfileData();
        } catch (error) {
            toast.error("Resume upload failed.");
        } finally {
            setUploading(false);
        }
    };


    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 text-xs tracking-[0.3em] uppercase italic">Syncing Profile...</p>
        </div>
    );





    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <BrandLogo />
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


            <main className="pt-[85px] flex-1">
                {/* Profile Header - VISUAL FIX HERE */}
                <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="size-36 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                            {profile?.name?.charAt(0) || "U"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white size-10 rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black tracking-tight">{profile?.name || "Job Seeker"}</h1>
                    <p className="text-blue-600 font-black text-xl mt-2 italic">{profile?.role || "Web Developer"}</p>

                    <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-2">
                            <Mail size={18} /> {profile?.email}
                        </span>

                        {/* Visual Fix for Phone and Location */}
                        <span className="flex items-center gap-2">
                            <Phone size={18} /> {hasData(profile?.phone) ? profile.phone : "Add phone"}
                        </span>

                        <span className="flex items-center gap-2">
                            <MapPin size={18} /> {hasData(profile?.location) ? profile.location : "Add location"}
                        </span>

                    </div>

                    {/* Displaying Street Address and Pincode visually */}
                    {(hasData(profile?.street_address) || hasData(profile?.pincode)) && (
                        <div className="mt-4 px-4 py-2 bg-slate-100 rounded-full inline-flex items-center gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {hasData(profile?.street_address) && profile.street_address}
                                {hasData(profile?.pincode) && ` | PIN: ${profile.pincode}`}
                            </p>
                        </div>
                    )}

                    <button onClick={() => navigate('/edit-contact')} className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-3">
                        <Edit3 size={20} /> Edit Header
                    </button>
                </div>
            </main>
            <main className="max-w-4xl mx-auto px-6 space-y-10">
                {/* Resume Section */}
                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-smhover:shadow-md transition-all cursor-pointer group">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6">
                        <FileText size={26} className="text-blue-600" /> Resume
                    </h3>

                    <div className="border-2 border-slate-50 rounded-3xl p-6 flex items-center justify-between group hover:border-blue-100 transition-all relative">
                        <div className="flex items-center gap-5">
                            <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-slate-800 truncate max-w-[200px]">
                                    {profile?.resume_url || "No resume uploaded"}
                                </h4>
                                <p className="text-xs font-black text-slate-400">Added {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* 3 DOT MENU BUTTON */}
                        <div className="relative">
                            <button
                                onClick={() => setIsResumeMenuOpen(!isResumeMenuOpen)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
                            >
                                <MoreVertical size={24} />
                            </button>

                            {/* ACTUAL DROPDOWN MENU (Indeed Style) */}
                            {isResumeMenuOpen && (
                                <div className="absolute right-0 top-12 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <button onClick={handleView} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">
                                        <Eye size={18} /> View
                                    </button>

                                    <button onClick={handleDownload} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">
                                        <Download size={18} /> Download
                                    </button>

                                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-colors">
                                        <CloudUpload size={18} /> Replace file
                                    </button>

                                    <div className="h-[1px] bg-slate-100 my-1"></div>

                                    <button onClick={handleDelete} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-bold text-sm transition-colors">
                                        <Trash2 size={18} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hidden File Input for Replace/Upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                    />
                </section>

                {/* Professional Summary Section */}
                <section
                    onClick={() => navigate('/edit-summary')}
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative group cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
                >
                    {/* Edit Icon */}
                    <div className="absolute top-8 right-8 text-slate-300 group-hover:text-blue-600 transition-colors">
                        <Edit3 size={22} />
                    </div>

                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                        <User size={26} className="text-blue-600" /> Professional Summary
                    </h3>

                    <div className="text-slate-600 font-medium leading-relaxed text-lg">
                        {profile?.summary ? (
                            <div>
                                {/* Summary irundha kaatum */}
                                <p className="whitespace-pre-line text-slate-700">{profile.summary}</p>
                                <div className="mt-4 flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Click to update summary</span>
                                </div>
                            </div>
                        ) : (
                            /* Summary illana 'Add' box kaatum */
                            <div className="border-2 border-dashed border-slate-100 p-8 rounded-3xl text-center bg-slate-50/30">
                                <p className="text-slate-400 italic mb-3">No professional summary added yet.</p>
                                <span className="text-blue-600 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                                    <Edit3 size={18} /> Add Summary
                                </span>
                            </div>
                        )}
                    </div>
                </section>
                {/* Qualifications Section */}
                <section
                    onClick={() => navigate('/qualifications')} // <--- Indha line-ah add pannunga
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm mt-6 hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Qualifications</h3>
                            <p className="text-slate-500 font-medium">Highlight your skills and experience.</p>
                        </div>
                        {/* Indha button-ah click panna navigate aagum */}
                        <ChevronRight size={28} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </section>

                {/* Job Preferences Section */}
                <section onClick={() => navigate('/preferences')}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative group mt-6hover:shadow-md transition-all cursor-pointer group">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                            Job preferences
                        </h3>
                        <button onClick={() => navigate('/preferences')}>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <p className="text-slate-400 font-medium italic">Save specific details like minimum desired pay and schedule.</p>
                </section>

                {/* Ready to work Section */}
               <section
                    onClick={() => navigate('/ready-to-work')} // <--- Indha line-ah add pannunga
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm mt-6 hover:shadow-md transition-all cursor-pointer group"
                >
                                        <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                            Ready to work
                        </h3>
                        <button className="text-slate-400 hover:text-blue-600 transition-all">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <p className="text-slate-400 font-medium italic">Let employers know that you're available to start working as soon as possible.</p>
                </section>
            </main>


        </div>
    );
}