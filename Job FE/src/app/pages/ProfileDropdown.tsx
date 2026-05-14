import { useState, useEffect, useRef } from "react";
import { User, FileText, Settings, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import pannanum

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate(); // Navigation initialize panrom

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Profile-ku navigate panni dropdown-ah close panra function
  const handleProfileClick = () => {
    setOpen(false);
    navigate("/profile");
  };

  return (
    <div className="relative" ref={menuRef}>
      
      {/* PROFILE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 active:scale-95"
      >
        <div className="size-8 bg-slate-900 rounded-full flex items-center justify-center text-white">
            <User size={18} />
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* USER INFO HEADER */}
          <div className="px-5 py-5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-800 truncate">
              {userEmail || "jothikali306@gmail.com"}
            </p>
          </div>

          {/* MENU OPTIONS */}
          <div className="py-2">
            
            {/* 1. PROFILE OPTION (Updated with Navigation) */}
            <button 
              onClick={handleProfileClick}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400 group-hover:text-blue-600" />
                <span className="text-sm font-bold group-hover:text-slate-900">Profile</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
            </button>

            {/* 2. MY RESUME / DOCUMENTS */}
           

            {/* 3. SETTINGS */}
            <button className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-600 transition-colors group">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-slate-400 group-hover:text-blue-600" />
                <span className="text-sm font-bold group-hover:text-slate-900">Settings</span>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
            </button>
          </div>

          <div className="border-t border-slate-100 my-1"></div>

          {/* LOGOUT */}
          <button 
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => {
              localStorage.removeItem("userEmail");
              localStorage.removeItem("user"); // Profile data-vum clear pannuvom
              window.location.href = "/login";
            }}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      )}
    </div>
  );
}