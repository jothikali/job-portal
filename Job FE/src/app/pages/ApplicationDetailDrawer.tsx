import React, { useEffect } from 'react';
import {
  X, Calendar, MapPin, CheckCircle2, ArrowUpRight,
  Clock, Building2, Layout, Video, User,
  Mail, Briefcase, Banknote, History
} from 'lucide-react';
import { toast } from '../lib/toast';

interface HistoryEntry { status: string; timestamp: string; }

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    status: string;
    skills?: string;
    applied_date?: string;
    interview_date?: string;
    interview_time?: string;
    interview_link?: string;
    user_name?: string;
    user_email?: string;
    job_description?: string;
    salary_range?: string;
    experience_req?: string;
    status_history?: string;
  } | null;
}

// ─── Candidate-facing audit timeline ─────────────────────────────────────────
function CandidateTimeline({ raw }: { raw?: string }) {
    let entries: HistoryEntry[] = [];
    try { entries = raw ? JSON.parse(raw) : []; } catch { entries = []; }

    const dotColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('HIRED') || s.includes('OFFER')) return 'bg-emerald-500';
        if (s.includes('REJECTED')) return 'bg-red-500';
        if (s.includes('HR')) return 'bg-purple-500';
        if (s.includes('TECHNICAL')) return 'bg-indigo-500';
        if (s.includes('APTITUDE') || s.includes('FINISHED')) return 'bg-blue-500';
        if (s.includes('SHORTLISTED')) return 'bg-cyan-500';
        return 'bg-slate-400';
    };

    if (entries.length === 0) return (
        <p className="text-[10px] text-slate-400 italic font-medium">Your application journey will appear here as it progresses.</p>
    );

    return (
        <div className="relative ml-2 space-y-0">
            {entries.map((entry, idx) => (
                <div key={idx} className="relative flex gap-4 pb-4">
                    {idx < entries.length - 1 && (
                        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100" />
                    )}
                    <div className={`mt-1 size-3.5 rounded-full ${dotColor(entry.status)} shrink-0 shadow-sm ring-2 ring-white`} />
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-tight">{entry.status}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{entry.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

const ApplicationDetailDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, job }) => {
  const handleWithdraw = async () => {
    const appId = job?.id; // backend-la namma mathuna appo idhu Application ID-ah irukkum

    if (!appId) {
      toast.error("Application ID not found!");
      return;
    }

    if (!window.confirm("Are you sure you want to withdraw?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/withdraw/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.status === "Success") {
        toast.success("Application moved to archive!");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!job) return null;

  const steps = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Review', key: 'Review' },
    { label: 'Interview', key: 'Interview' },
    { label: 'Hired', key: 'Hired' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key.toLowerCase() === job.status?.toLowerCase());

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl bg-white z-[101] shadow-2xl transform transition-all duration-500 rounded-[32px] border border-slate-200 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
          }`}
      >

        {/* Header */}
        <div className="p-4 md:p-8 border-b border-slate-100 bg-white sticky top-0 z-20">
          <button onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all active:scale-90">
            <X size={18} />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-900 rounded-[18px] md:rounded-[24px] flex items-center justify-center text-white text-2xl md:text-4xl font-black shadow-xl shrink-0 uppercase">
              {job.company?.charAt(0)}
            </div>
            <div className="pt-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {job.status || 'Applied'}
              </div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1 leading-tight truncate">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <span className="flex items-center gap-1.5"><Building2 size={12} /> {job.company}</span>
                <span className="flex items-center gap-1.5 hidden sm:flex"><MapPin size={12} /> {job.location}</span>
                <span className="flex items-center gap-1.5 hidden sm:flex"><Calendar size={12} /> Applied {job.applied_date || 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] md:max-h-[65vh] p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/30">

          {/* 1. Stepper Section */}
          <section className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 md:mb-10 flex items-center gap-2">
              <Layout size={16} className="text-blue-500" /> Application Journey
            </h3>
            {/* Scrollable horizontal stepper on mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max md:min-w-0 md:grid md:grid-cols-4 relative">
                <div className="hidden md:block absolute top-5 left-10 right-10 h-0.5 bg-slate-100 -z-0" />
                {steps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center px-3 md:px-0">
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 ${i <= currentStepIndex ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                      {i < currentStepIndex ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <p className={`text-[9px] font-black mt-2 md:mt-4 uppercase tracking-tighter whitespace-nowrap ${i === currentStepIndex ? 'text-blue-600' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {i < steps.length - 1 && (
                      <div className="md:hidden absolute left-full top-[18px] w-6 h-0.5 bg-slate-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. Your Submission (Dynamic from u.username & u.email) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
                <User size={16} className="text-indigo-500" /> Your Submission
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><User size={14} /></div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Full Name</p>
                    <p className="text-sm font-black text-slate-800">{job.user_name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={14} /></div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black">Email</p>
                    <p className="text-sm font-black text-slate-800">{job.user_email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black mb-2">Skills Provided</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills ? job.skills.split(',').map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase">
                        {s.trim()}
                      </span>
                    )) : <span className="text-[10px] text-slate-400">No skills listed</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Role Overview (Dynamic from j.description) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Briefcase size={16} className="text-orange-500" /> Role Overview
              </h3>
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-6">
                  {job.job_description || "Description not available for this role."}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[8px] text-emerald-600 uppercase font-black mb-1">Salary Range</p>
                    <p className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                      <Banknote size={12} /> {job.salary_range || 'Competitive'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Experience</p>
                    <p className="text-[11px] font-black text-slate-700">
                      {job.experience_req || 'Entry Level'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interview Banner */}
          {job.status === 'Interview' && job.interview_date && (
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30">
                  <Calendar size={28} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-1">Technical Interview</p>
                  <p className="text-xl font-black">
                    {new Date(job.interview_date).toLocaleDateString('en-GB')} | {job.interview_time}
                  </p>
                </div>
              </div>
              {job.interview_link && (
                <a href={job.interview_link} target="_blank" className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                  <Video size={18} /> Join Meeting
                </a>
              )}
            </div>
          )}

          {/* 5. Status History Timeline */}
          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <History size={16} className="text-indigo-400" /> Application Timeline
            </h3>
            <CandidateTimeline raw={job.status_history} />
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-8 py-5 md:py-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button onClick={() => handleWithdraw()}
            className="flex-1 px-6 py-3.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
            Withdraw
          </button>
          <button className="flex-[2] px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group">
            Full Job Details <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetailDrawer;