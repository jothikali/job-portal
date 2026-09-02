import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, LayoutDashboard, Users, FileText, LogOut,
  TrendingUp, Eye, CheckCircle, XCircle, Plus, X, MapPin, DollarSign, Send, Home,
  Layers, ListChecks, Star
} from 'lucide-react';
import { toast } from '../lib/toast';

// Interfaces

interface Candidate {
  id: string | number;
  name: string;
  email: string;
  title: string;
  skills: string | string[];
  status?: string;
  appliedDate?: string;
}

interface Application {
  candidateId: string | number;
  status: string;
  appliedDate: string;
}

export function RecruiterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // States for Data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "TVS Automobile Solutions",
    location: "",
    type: "Full-time",
    salary: "",
    category: "Development",
    description: "",
    requirements: "",
    features: ""
  });

  // --- API Fetching Logic (Updated with Error Handling) ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [candRes, appRes, jobsRes] = await Promise.all([
        fetch('http://localhost:5000/api/candidates'),
        fetch('http://localhost:5000/api/applications'),
        fetch('http://localhost:5000/api/jobs')
      ]);

      // JSON-ஆக மாற்றுவதற்கு முன் Response OK-வா என்று பார்க்கிறோம்
      const candData = candRes.ok ? await candRes.json() : [];
      const appData = appRes.ok ? await appRes.json() : [];
      const jobsData = jobsRes.ok ? await jobsRes.json() : [];

      setCandidates(Array.isArray(candData) ? candData : []);
      setApplications(Array.isArray(appData) ? appData : []);
      setJobsCount(Array.isArray(jobsData) ? jobsData.length : 0);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- HANDLE JOB POST ---
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Job posted successfully!");
        setIsModalOpen(false);
        setFormData({
          title: "", company: "TVS Automobile Solutions", location: "",
          type: "Full-time", salary: "", category: "Development",
          description: "", requirements: "", features: ""
        });
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to post job'}`);
      }
    } catch (error) {
      toast.error("Error connecting to server! Check if your backend is running.");
    } finally {
      setIsPosting(false);
    }
  };

  // Stats Calculation
  const totalApplicants = candidates?.length || 0;
  const pendingApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === 'pending').length
    : 0;
  const shortlisted = Array.isArray(applications)
    ? applications.filter((app) => app.status === 'shortlisted').length
    : 0;

  const candidatesWithStatus = candidates.map((candidate) => {
    const application = applications.find((app) => String(app.candidateId) === String(candidate.id));
    return {
      ...candidate,
      status: application?.status || 'pending',
      appliedDate: application?.appliedDate || 'N/A',
    };
  });

  const handleAction = async (action: string, candidateId: string | number) => {
    toast.info(`Candidate #${candidateId} marked as ${action}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="font-bold text-muted-foreground text-lg">Loading Dashboard Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex-shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Briefcase className="size-6 text-accent" />
            <span className="font-bold text-xl tracking-tight">JobPortal</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Recruiter Panel</p>
        </div>

        <nav className="p-4 flex flex-col h-[calc(100vh-100px)]">
          <div className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}>
              <LayoutDashboard className="size-5" />
              <span>Dashboard</span>
            </button>

            <button onClick={() => setActiveTab('candidates')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'candidates' ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}>
              <Users className="size-5" />
              <span>Candidates</span>
            </button>
          </div>

          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors mt-auto mb-2">
            <Home className="size-5" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="mt-2 border-t border-border pt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors font-bold">
              <LogOut className="size-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black mb-2 text-foreground">Recruiter Overview</h1>
              <p className="text-muted-foreground font-medium">Monitoring {totalApplicants} candidates across {jobsCount} job roles.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="size-5" /> Post Job
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatsCard icon={<Users className="text-accent" />} label="Total Applicants" value={totalApplicants} trend="+12%" />
            <StatsCard icon={<Briefcase className="text-primary" />} label="Active Jobs" value={jobsCount} trend="+5%" />
            <StatsCard icon={<FileText className="text-yellow-600" />} label="Pending Reviews" value={pendingApplications} color="yellow" />
            <StatsCard icon={<CheckCircle className="text-green-600" />} label="Shortlisted" value={shortlisted} trend="+8%" color="green" />
          </div>

          {/* Candidates Table */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-card">
              <h2 className="font-bold text-xl text-foreground">Recent Applicants</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase text-muted-foreground">Candidate</th>
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase text-muted-foreground">Position</th>
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase text-muted-foreground">Applied Date</th>
                    <th className="text-right px-6 py-4 font-bold text-xs uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {candidatesWithStatus.length > 0 ? (
                    candidatesWithStatus.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{candidate.name}</div>
                          <div className="text-xs text-muted-foreground">{candidate.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{candidate.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{candidate.appliedDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => navigate(`/candidate/${candidate.id}`)} className="p-2 hover:bg-muted rounded-lg text-primary"><Eye className="size-5" /></button>
                            <button onClick={() => handleAction('hire', candidate.id)} className="p-2 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle className="size-5" /></button>
                            <button onClick={() => handleAction('reject', candidate.id)} className="p-2 hover:bg-red-50 rounded-lg text-destructive"><XCircle className="size-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground font-medium">No candidates found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL (Job Post Form) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-black text-foreground">Post a New Job</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full text-foreground"><X className="size-5" /></button>
              </div>

              <form onSubmit={handlePostJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input required className="w-full bg-background border border-border rounded-xl px-10 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="React Developer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Category</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input required className="w-full bg-background border border-border rounded-xl px-10 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="IT / Design" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input required className="w-full bg-background border border-border rounded-xl px-10 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="Chennai" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Salary</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input required className="w-full bg-background border border-border rounded-xl px-10 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="6LPA - 10LPA" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Job Type</label>
                    <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Remote">Remote</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground">Company</label>
                    <input required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-foreground">Description</label>
                  <textarea required rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="About the role..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground flex items-center gap-2"><ListChecks className="size-4" /> Requirements</label>
                    <textarea rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="Skills needed..." value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-foreground flex items-center gap-2"><Star className="size-4" /> Benefits</label>
                    <textarea rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent text-foreground" placeholder="Perks..." value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })}></textarea>
                  </div>
                </div>

                <button type="submit" disabled={isPosting} className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-md">
                  {isPosting ? "Posting..." : <><Send className="size-4" /> Publish Job Now</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
function StatsCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-muted">{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp className="size-3" /> {trend}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-black mb-1 text-foreground">{value}</h3>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function getStatusStyles(status: string = 'pending') {
  switch (status.toLowerCase()) {
    case 'shortlisted': return 'bg-blue-100 text-blue-700';
    case 'hired': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-yellow-100 text-yellow-700';
  }
}