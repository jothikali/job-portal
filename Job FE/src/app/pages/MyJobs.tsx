import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell, Briefcase, Bookmark, CheckCircle,
  MessageSquare, Archive, MapPin, DollarSign, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import ProfileMenu from './ProfileDropdown';
import InterviewCard from './InterviewCard';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';

const MyJobs = () => {
  const [activeTab, setActiveTab] = useState('applied');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 1; // Change to dynamic ID after login setup
  const navigate = useNavigate();

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  // --- PREMIUM PDF GENERATION LOGIC ---
  const handleDownloadOffer = (job: any) => {
    const doc = new jsPDF();
    
    // Design Elements: Sidebar Accent
    doc.setFillColor(15, 23, 42); // Dark Slate
    doc.rect(0, 0, 15, 297, 'F');

    // Header: Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text(job.company.toUpperCase(), 25, 35);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("OFFICIAL LETTER OF APPOINTMENT", 25, 42);
    
    // Styling Line
    doc.setDrawColor(226, 232, 240);
    doc.line(25, 50, 195, 50);

    // Date & Ref
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, 65);
    doc.text(`Ref: HR/OFFER/${job.id || '2026'}/SEC-A`, 25, 72);

    // Salutation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Dear Candidate,`, 25, 90);

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const message = `Following your recent interview and selection process, we are delighted to offer you the position of ${job.title} at ${job.company}. We were impressed with your technical skills and believe you will contribute significantly to our mission.`;
    const splitMessage = doc.splitTextToSize(message, 165);
    doc.text(splitMessage, 25, 100);

    // Job Details Box
    doc.setFillColor(248, 250, 252);
    doc.rect(25, 130, 165, 50, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(25, 130, 165, 50, 'S');

    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYMENT DETAILS", 107, 138, { align: 'center' });
    doc.line(80, 140, 135, 140);

    doc.text("Role:", 35, 152);
    doc.setFont("helvetica", "normal");
    doc.text(`${job.title}`, 85, 152);

    doc.setFont("helvetica", "bold");
    doc.text("Company:", 35, 162);
    doc.setFont("helvetica", "normal");
    doc.text(`${job.company}`, 85, 162);

    doc.setFont("helvetica", "bold");
    doc.text("Joining Date:", 35, 172);
    doc.setFont("helvetica", "normal");
    doc.text("Immediate / As discussed", 85, 172);

    // Closing
    const closing = `Please confirm your acceptance of this offer by replying to the HR email within 48 hours. We look forward to welcoming you to the ${job.company} family.`;
    const splitClosing = doc.splitTextToSize(closing, 165);
    doc.text(splitClosing, 25, 200);

    // Signatory
    doc.setFont("helvetica", "bold");
    doc.text("Sincerely,", 25, 240);
    doc.text("Head of Talent Acquisition", 25, 260);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${job.company} - Human Resources Department`, 25, 265);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Note: This is a system-generated document. No physical signature is required.", 105, 285, { align: 'center' });

    doc.save(`${job.company}_OfferLetter.pdf`);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'saved'
          ? `http://localhost:5000/api/jobs/saved-jobs/${userId}`
          : `http://localhost:5000/api/jobs/applied-jobs/${userId}`;

        const res = await axios.get(endpoint);
        const allData = Array.isArray(res.data) ? res.data : [];

        if (activeTab === 'saved') {
          setJobs(allData);
        } 
        else if (activeTab === 'interviews') {
          setJobs(allData.filter((job: any) => {
            const s = job?.status?.toUpperCase() || '';
            return ['SHORTLISTED', 'INTERVIEW', 'TECHNICAL', 'TECHNICAL ROUND', 'HR DISCUSSION'].includes(s);
          }));
        } 
        else if (activeTab === 'archived') {
          setJobs(allData.filter((job: any) => {
            const s = job?.status?.toUpperCase() || '';
            return ['HIRED', 'REJECTED', 'WITHDRAWN'].includes(s);
          }));
        } 
        else {
          setJobs(allData.filter((job: any) => {
             const s = job?.status?.toUpperCase() || '';
             return !['HIRED', 'REJECTED', 'WITHDRAWN'].includes(s);
          }));
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeTab, userId]);

  const tabs = [
    { id: 'saved', label: 'Saved', icon: <Bookmark size={18} /> },
    { id: 'applied', label: 'Applied', icon: <CheckCircle size={18} /> },
    { id: 'interviews', label: 'Interviews', icon: <MessageSquare size={18} /> },
    { id: 'archived', label: 'Archived', icon: <Archive size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Briefcase className="size-6 text-[#0F172A]" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white uppercase">JobPortal</span>
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

      <main className="pt-[85px]">
        <div className="max-w-4xl mx-auto mt-16 px-6 pb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Dashboard</p>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">My Jobs</h1>
            </div>
          </div>

          <div className="flex border-b mb-12 overflow-x-auto scrollbar-hide gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-8 py-5 border-b-[4px] transition-all whitespace-nowrap group ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="animate-spin rounded-xl h-10 w-10 border-t-4 border-blue-600 border-r-4 border-r-transparent"></div>
                <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Database...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid gap-8">
                {jobs.map((job) => {
                  if (activeTab === 'interviews') {
                    return <InterviewCard key={job.id} job={job} />;
                  }

                  const isSavedTab = activeTab === 'saved';
                  const isHired = job.status?.toUpperCase() === 'HIRED';

                  return (
                    <div key={job.id} className="group p-8 border border-slate-200 rounded-[35px] shadow-sm hover:shadow-xl transition-all bg-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                      <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{job.title}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{job.company}</p>

                        <div className="mt-6 flex flex-wrap justify-center md:justify-start items-center gap-4">
                          {isSavedTab ? (
                            <>
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <MapPin size={12} className="text-blue-500"/> {job.location || 'Remote'}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <DollarSign size={12} className="text-emerald-500"/> {job.salary_range || 'Competitive'}
                              </span>
                            </>
                          ) : (
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                              job.status?.toLowerCase() === 'shortlisted' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                              job.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                              job.status?.toLowerCase() === 'hired' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {job.status || 'Applied'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6 md:mt-0">
                        {isSavedTab ? (
                          <>
                            <button className="p-4 bg-slate-50 text-blue-600 rounded-2xl hover:bg-blue-50 transition-colors border border-slate-100">
                              <Bookmark size={20} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => navigate(`/apply/${job.job_id || job.id}`)}
                              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                            >
                              Apply Now
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            {isHired && (
                              <button
                                onClick={() => handleDownloadOffer(job)}
                                className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                              >
                                <Download size={16} /> Download Offer
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(job)}
                              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                            >
                              {activeTab === 'archived' ? 'History' : 'View Status'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <Archive size={32} />
                </div>
                <h2 className="text-slate-900 font-black text-xl uppercase tracking-tight">Nothing Found</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Explore more jobs to fill this space</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ApplicationDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        job={selectedJob} 
      />
    </div>
  );
};

export default MyJobs;