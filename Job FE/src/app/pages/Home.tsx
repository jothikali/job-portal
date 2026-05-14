import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { useState } from 'react';

// 1. Default Import (பிராக்கெட் இல்லாமல் - இதுதான் எரரைச் சரி செய்யும்)
import CompanyReviews from './CompanyReviews';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

 

  // தேடலை கையாளும் ஃபங்க்ஷன்
  const handleSearch = () => {
    if (searchQuery.trim() || location.trim()) {
      navigate(`/jobs?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* 3. Company Reviews Panel (இது பட்டன் கிளிக் செய்தால் மட்டுமே ஓபன் ஆகும்) */}
    

      {/* --- Navigation Bar --- */}
      <nav className="bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-12">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Briefcase className="size-6 text-[#0F172A]" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">JobPortal</span>
          </Link>

          {/* Left Menu Links */}
          <div className="hidden md:flex items-center gap-10 text-[16px] font-bold">
            <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Find Jobs</Link>

            {/* --- Company Reviews Button (Indeed Style) --- */}
            <Link
              to="/reviews"
              className="text-slate-300 hover:text-white transition-colors "
              
            >
              Company reviews
            </Link>

          </div>
        </div>

        {/* Right Menu Links (Sign in / Post Job) */}
        <div className="flex items-center gap-8 text-[16px] font-bold">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign in</Link>
          <div className="h-5 w-[1px] bg-white/20"></div>
          <Link
            to="/login?redirect=/post-job"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Employers | Post Job
          </Link>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto pt-24 px-6 flex flex-col items-center">

        {/* Search Bar Structure */}
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center p-1.5 mb-24 overflow-hidden">
          <div className="flex-1 w-full flex items-center px-6 py-5 border-b md:border-b-0 md:border-r border-slate-100 group focus-within:ring-1 ring-primary/20 transition-all">
            <Search className="size-5 text-slate-400 mr-4" />
            <div className="flex flex-col flex-1 text-left">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="outline-none text-slate-800 font-bold bg-transparent placeholder:font-normal placeholder:text-slate-400 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="flex-1 w-full flex items-center px-6 py-5 group focus-within:ring-1 ring-primary/20 transition-all">
            <MapPin className="size-5 text-slate-400 mr-4" />
            <div className="flex flex-col flex-1 text-left">
              <input
                type="text"
                placeholder="City or state"
                className="outline-none text-slate-800 font-bold bg-transparent placeholder:font-normal placeholder:text-slate-400 w-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="bg-[#0F172A]  text-white px-14 py-5 rounded-xl font-black text-lg transition-all w-full md:w-auto mx-1 shadow-lg active:scale-95"
          >
            Find jobs
          </button>
        </div>

        {/* Branding Section */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-5 mb-8">
            <div className="bg-[#0F172A] p-5 rounded-[28px] shadow-2xl shadow-blue-200 rotate-[-5deg]">
              <Briefcase className="size-16 text-white" />
            </div>
            <span className="text-7xl font-black tracking-tighter text-[#0F172A]">JobPortal</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Your next job starts here
            </h2>
            <p className="text-[18px] text-slate-500 font-medium whitespace-nowrap">
              Create an account or sign in to see your personalised job recommendations.
            </p>
          </div>
          <Link to="/login">
            <button className="bg-[#0F172A]  text-white px-16 py-4.5 rounded-full font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-100 hover:gap-4 active:scale-95">
              Get Started <ChevronRight className="size-6" />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}