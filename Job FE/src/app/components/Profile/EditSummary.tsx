import { API } from '../../lib/api';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Bookmark, Bell, Briefcase, Loader2, ArrowLeft, Save
} from 'lucide-react';
import ProfileMenu from '../../pages/ProfileDropdown';
import { toast } from '../../lib/toast';

export default function EditSummary() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState('');
    const [saving, setSaving] = useState(false);

    // Initial Fetch: Current summary-ah load panna
    useEffect(() => {
        const fetchCurrentSummary = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = storedUser.id || storedUser.user?.id;

                if (userId) {
                    const response = await axios.get(`${API}/user/full-profile/${userId}`);
                    // Backend status 200 kudutha data-va set pannuvom
                    if (response.data) {
                        setSummary(response.data.summary || '');
                    }
                }
            } catch (error) {
                console.error("Fetch Current Summary error:", error);
            }
        };
        fetchCurrentSummary();
    }, []);

    // Save Logic: Type panni save panna
    const handleSave = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = storedUser.id || storedUser.user?.id;

        if (!userId) {
            toast.error("Session expired. Please login again.");
            return;
        }

        setSaving(true);
        try {
            await axios.put(`${API}/user/update-summary`, {
                userId: userId,
                summary: summary
            });
            toast.success("Summary updated!");
            navigate('/profile');
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Server error! Make sure your backend is running.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Navigation */}
            <nav className="bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
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
                        <Bookmark size={22} className="text-slate-300 cursor-pointer" />
                        <Bell size={22} className="text-slate-300 cursor-pointer" />
                        <ProfileMenu />
                    </div>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <Link to="/post-job" className="text-slate-300 hover:text-white">Employers | Post Job</Link>
                </div>
            </nav>

            {/* Form Section */}
            <div className="max-w-2xl mx-auto mt-12 bg-white rounded-[2rem] p-10 shadow-sm border border-slate-200">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={20} /> Back
                </button>

                <h2 className="text-3xl font-black text-slate-900 mb-2">Edit Summary</h2>
                <p className="text-slate-500 font-medium mb-8">Write a brief overview of your professional background.</p>

                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="E.g. Experienced Frontend Developer with 2+ years of experience in React..."
                    className="w-full h-64 p-6 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none font-medium text-lg text-slate-700 transition-all resize-none shadow-inner bg-slate-50/50"
                />

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}