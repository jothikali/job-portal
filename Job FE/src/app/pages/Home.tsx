import BrandLogo from '../components/BrandLogo';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { InstallNavButton } from '../components/InstallBanner';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation]       = useState('');
  const [menuOpen, setMenuOpen]       = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const q = searchQuery.trim();
    const l = location.trim();
    navigate(q || l
      ? `/jobs?query=${encodeURIComponent(q)}&location=${encodeURIComponent(l)}`
      : '/jobs'
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="bg-[#0F172A] text-white shadow-md border-b border-white/10 w-full">
        <div className="flex items-center justify-between px-4 md:px-10 py-3 md:py-5">

          {/* Left: Logo + nav links */}
          <div className="flex items-center gap-4 md:gap-12 shrink-0">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
              <BrandLogo />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8 text-[15px] font-bold">
              <Link to="/home"    className="text-slate-300 hover:text-white transition-colors">Home</Link>
              <Link to="/home"    className="text-slate-300 hover:text-white transition-colors">Find Jobs</Link>
              <Link to="/reviews" className="text-slate-300 hover:text-white transition-colors">Company Reviews</Link>
            </div>
          </div>

          {/* Right: Desktop actions + mobile hamburger */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Install button — shows only when browser fires beforeinstallprompt */}
            <InstallNavButton />

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6 text-[15px] font-bold">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign in</Link>
              <div className="h-5 w-px bg-white/20" />
              <Link to="/login?redirect=/post-job" className="text-slate-300 hover:text-white transition-colors whitespace-nowrap">
                Employers | Post Job
              </Link>
            </div>

            {/* Mobile: Sign in link (compact) + hamburger */}
            <Link to="/login" className="md:hidden text-slate-300 hover:text-white font-bold text-sm transition-colors whitespace-nowrap">
              Sign in
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0F172A] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/home',                 label: 'Home'                  },
                { to: '/home',                 label: 'Find Jobs'             },
                { to: '/reviews',              label: 'Company Reviews'       },
                { to: '/login',                label: 'Sign In'               },
                { to: '/login?redirect=/post-job', label: 'Employers | Post Job' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-bold text-sm transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto pt-12 md:pt-24 px-4 sm:px-6 flex flex-col items-center">

        {/* ── SEARCH BOX ──────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center p-2 md:p-1.5 mb-12 md:mb-24 gap-2 md:gap-0 overflow-hidden">

          {/* Job title input */}
          <div className="flex-1 flex items-center px-4 py-3 md:px-6 md:py-5 border border-slate-100 md:border-0 md:border-r rounded-xl md:rounded-none focus-within:ring-2 ring-blue-100 transition-all">
            <Search className="size-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="outline-none text-slate-800 font-bold bg-transparent placeholder:font-normal placeholder:text-slate-400 w-full text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Location input */}
          <div className="flex-1 flex items-center px-4 py-3 md:px-6 md:py-5 border border-slate-100 md:border-0 rounded-xl md:rounded-none focus-within:ring-2 ring-blue-100 transition-all">
            <MapPin className="size-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="City or state"
              className="outline-none text-slate-800 font-bold bg-transparent placeholder:font-normal placeholder:text-slate-400 w-full text-sm md:text-base"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Find jobs button — full width on mobile */}
          <button
            onClick={handleSearch}
            className="bg-[#0F172A] text-white px-8 md:px-14 py-4 md:py-5 rounded-xl font-black text-base md:text-lg transition-all w-full md:w-auto md:mx-1 shadow-lg active:scale-95 hover:bg-slate-800"
          >
            Find jobs
          </button>
        </div>

        {/* ── HERO BRANDING ────────────────────────────────────────────── */}
        <div className="text-center flex flex-col items-center w-full px-4 sm:px-6">

          {/* Logo + wordmark — scales on mobile */}
          <div className="flex items-center gap-3 md:gap-5 mb-6 md:mb-8 flex-wrap justify-center">
            <img src="/icons/job-logo.jpeg" alt="Job Nest"
                 className="h-14 md:h-20 w-auto object-contain rounded-[20px] md:rounded-[28px] shadow-2xl shadow-blue-200 rotate-[-5deg] shrink-0" />
            <span className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#0F172A]">
              Job Nest
            </span>
          </div>

          {/* Hero text */}
          <div className="mb-8 max-w-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight leading-tight">
              Your next job starts here
            </h2>
            <p className="text-sm sm:text-base md:text-[18px] text-slate-500 font-medium leading-relaxed">
              Create an account or sign in to see your personalised job recommendations.
            </p>
          </div>

          <Link to="/login">
            <button className="bg-[#0F172A] text-white px-10 md:px-16 py-4 rounded-full font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-100 hover:gap-4 active:scale-95 text-sm md:text-base">
              Get Started <ChevronRight className="size-5 md:size-6" />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
