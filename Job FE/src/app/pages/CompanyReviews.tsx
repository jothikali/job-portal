import React, { useEffect, useState } from 'react';
import { Search, Star, Briefcase, TrendingUp, PenLine, X, Bookmark, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProfileMenu from './ProfileDropdown';
import { toast } from '../lib/toast';

const CompanyReviews = () => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // 1. Search மற்றும் Modal-க்கான States
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Form Input States
    const [formData, setFormData] = useState({
        company_name: '',
        job_title: '',
        rating: 5,
        location: '',
        review_text: ''
    });

    const fetchReviews = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/reviews');
            setCompanies(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    // 3. Search Filter Logic - டைப் பண்ணும்போது கம்பெனிகளை பில்டர் செய்யும்
    const filteredCompanies = companies.filter(comp =>
        comp.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. Submit Review Logic - டேட்டாவை DB-க்கு அனுப்பும்
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/reviews', formData);
            setIsModalOpen(false);
            fetchReviews();
            toast.success("Review submitted successfully!");
        } catch (error) {
            toast.error("Error saving review. Check your backend connection.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30">
            {/* Header */}
            {/* --- Navigation Bar --- */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
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
                        <Link to="/my-jobs" className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bookmark size={22} /></Link>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bell size={22} /></button>
                        <ProfileMenu />
                    </div>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Employers | Post Job</Link>
                </div>
            </nav>
            <main className="pt-[85px] flex-1">s
                <main className="max-w-6xl mx-auto pt-16 px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="text-left">
                            <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tight">
                                Find great <br /><span className="text-blue-600">places to work</span>
                            </h1>
                        </div>
                        {/* பட்டனை கிளிக் செய்தால் பாப்-அப் வரும் */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <PenLine size={20} /> Write a review
                        </button>
                    </div>

                    {/* --- Search Section (LIVE) --- */}
                    <div className="bg-white p-3 rounded-[24px] shadow-xl flex flex-col md:flex-row gap-2 mb-16 border border-slate-100">
                        <div className="flex-1 relative flex items-center px-4">
                            <Search className="text-blue-600 mr-4" size={24} />
                            <div className="w-full">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Company name</p>
                                <input
                                    type="text"
                                    className="w-full outline-none font-bold text-slate-800 text-lg"
                                    placeholder="Start typing to filter..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Grid View --- */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-black text-slate-900 mb-8">Popular companies</h2>
                        {loading ? (
                            <div className="text-center py-20 font-bold text-slate-400">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCompanies.map((comp, i) => (
                                    <div key={i} className="bg-white p-7 rounded-[32px] border border-slate-100 hover:shadow-2xl transition-all flex flex-col h-full">
                                        <div className="flex items-start gap-5 mb-6">
                                            <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center font-black text-white text-2xl">
                                                {comp.company_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{comp.job_title}</p>
                                                <h4 className="font-black text-slate-900 text-xl">{comp.company_name}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="font-black text-yellow-700 text-sm">{comp.rating}</span>
                                                    <span className="text-slate-400 font-medium text-[12px]">{comp.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-8 italic italic">"{comp.review_text}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </main>
            {/* --- "Write a Review" Modal (பாப்-அப் விண்டோ) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={28} />
                        </button>

                        <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Share your experience</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Company Name</label>
                                    <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-600 font-bold"
                                        onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Your Job Title</label>
                                    <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-600 font-bold"
                                        onChange={e => setFormData({ ...formData, job_title: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Rating (1-5)</label>
                                    <input required type="number" min="1" max="5" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-600 font-bold"
                                        onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Location</label>
                                    <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-600 font-bold"
                                        onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Your Review</label>
                                <textarea required className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-600 font-bold h-32 resize-none"
                                    onChange={e => setFormData({ ...formData, review_text: e.target.value })} />
                            </div>

                            <button type="submit" className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-black text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-200">
                                Post My Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyReviews;