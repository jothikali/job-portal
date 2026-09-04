import BrandLogo from '../components/BrandLogo';
import { API } from '../lib/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bell, MessageSquare, Bookmark, User, ChevronDown, Search, MapPin, Briefcase, DollarSign, ChevronRight, CheckCircle } from 'lucide-react';
import ProfileMenu from './ProfileDropdown';
import { toast } from '../lib/toast';
import { InstallNavButton } from '../components/InstallBanner';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  postedDate: string;
  description: string;
  requirements: string;
  featured: number | boolean;
}

export function JobListings() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // ✅ PUDHU STATE: User apply panna job IDs-ah store panna
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  const currentUser = { id: 1 }; // Currently hardcoded
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ PUDHU FUNCTION: Applied jobs list-ah fetch panna
  // ✅ UPDATE THIS FUNCTION IN YOUR CODE
  const fetchAppliedJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs/applied-jobs/${currentUser.id}`);

      // IMPORTANT: applications table-la irundhu vara 'job_id'-ah yedukanum
      // 'job.id' nu potta adhu application row-oda ID-ya poiyidudhu
      const ids = res.data.map((app: any) => Number(app.job_id));

      console.log("Applied Job IDs:", ids); // Debug panni paaka
      setAppliedJobIds(ids);
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };
  const handleSaveJob = async (jobId: string) => {
    try {
      if (!currentUser) {
        toast.warn("Please login to save jobs!");
        return;
      }
      const response = await axios.post(`${API}/jobs/save-job`, {
        userId: currentUser.id,
        jobId: jobId
      });
      if (response.status === 200) {
        toast.success("Job saved successfully!");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.info("Job already saved!");
      } else {
        console.error("Error saving job", error);
        toast.error("Failed to save job.");
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('query');
    const locParam = params.get('location');
    if (queryParam) setSearchTerm(queryParam);
    if (locParam) setLocationSearch(locParam);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);

    // ✅ Jobs fetch pannum podhe applied status-aiyum fetch panrom
    fetchAppliedJobs();

    fetch(`${API}/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error('Server Error');
        return res.json();
      })
      .then((data) => {
        const jobsArray = Array.isArray(data) ? data : [];
        setJobs(jobsArray);
        if (jobsArray.length > 0) setSelectedJob(jobsArray[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setJobs([]);
        setLoading(false);
      });
  }, []);

  const filteredJobs = useMemo(() => {
    const currentJobs = Array.isArray(jobs) ? jobs : [];

    return currentJobs.filter(job => {
      const matchesSearch =
        (job.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (job.company?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesLocation =
        (job.location?.toLowerCase() || "").includes(locationSearch.toLowerCase());

      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, locationSearch, selectedTypes]);

  useEffect(() => {
    if (filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    } else {
      setSelectedJob(null);
    }
  }, [searchTerm, locationSearch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* --- Navigation Bar --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A] text-white py-4 px-4 md:px-10 shadow-md flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4 md:gap-12">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <BrandLogo />
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[16px] font-bold">
            <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
            <Link to="/reviews" className="text-slate-300 hover:text-white transition-colors">Company reviews</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-8 font-bold text-sm">
          <div className="flex items-center gap-2 md:gap-6">
            <Link to="/my-jobs" className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bookmark size={20} /></Link>
            <button className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bell size={20} /></button>
            <InstallNavButton />
            <ProfileMenu />
          </div>
          <div className="hidden md:block h-5 w-[1px] bg-white/20" />
          <Link to="/login" className="hidden md:block text-slate-300 hover:text-white transition-colors">Employers | Post Job</Link>
        </div>
      </nav>
<main className="pt-[72px] md:pt-[85px] flex-1">
      {/* Search Header */}
      <div className="bg-white border-b py-4 md:py-8 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 bg-white border-2 border-slate-100 rounded-2xl p-2 shadow-lg focus-within:border-primary transition-all">
            <div className="flex-1 flex items-center px-3 gap-3 sm:border-r border-slate-100">
              <Search className="text-slate-400 size-5 shrink-0" />
              <input type="text" placeholder="Job title or company"
                className="w-full outline-none font-bold py-2 text-slate-800 text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 px-3 sm:flex-1">
              <MapPin className="text-slate-400 size-5 shrink-0" />
              <input type="text" placeholder="Location"
                className="w-full outline-none font-bold py-2 text-slate-800 text-sm"
                value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} />
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-black hover:opacity-90 transition-all text-sm">Find jobs</button>
          </div>
        </div>
      </div>
</main>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column — full width on mobile, fixed on desktop */}
        <div className="w-full lg:w-[420px] space-y-3 lg:overflow-y-auto lg:max-h-[calc(100vh-200px)] custom-scrollbar shrink-0">
          <h2 className="font-black text-xl text-slate-800 mb-6">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </h2>
          {loading ? (
            <div className="text-center py-10 italic text-slate-500 font-bold">Loading jobs...</div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-6 bg-white rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${selectedJob?.id === job.id ? 'border-primary' : 'border-transparent shadow-sm'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{job.title}</h3>
                    <p className="text-slate-600 font-bold mt-1">{job.company}</p>
                    <p className="text-slate-500 text-sm mt-1">{job.location}</p>
                  </div>
                  <Bookmark
                    className="text-slate-300 size-5 hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveJob(job.id);
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-black px-3 py-1 rounded-lg">{job.salary}</span>
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-black px-3 py-1 rounded-lg">{job.type}</span>
                </div>

                {/* ✅ UPDATE: Job card status view */}
                <div className="mt-4 font-bold text-sm flex items-center gap-1">
                  {appliedJobIds.includes(Number(job.id)) ? (
                    <span className="text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-lg">
                      Applied <CheckCircle size={14} />
                    </span>
                  ) : (
                    <span className="text-primary flex items-center gap-1">
                      Easily apply <ChevronRight className="size-4" />
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 font-bold">No jobs found matching your search.</div>
          )}
        </div>

        {/* Right Column */}
        <div className="hidden lg:block flex-1 bg-white border border-slate-200 rounded-[32px] overflow-hidden sticky top-28 h-[calc(100vh-140px)] shadow-sm">
          {selectedJob ? (
            <div className="h-full flex flex-col">
              <div className="p-8 border-b">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedJob.title}</h2>
                <div className="flex items-center gap-4 mt-3">
                  <p className="text-lg text-primary font-bold hover:underline cursor-pointer">{selectedJob.company}</p>
                  <span className="text-slate-300">•</span>
                  <p className="text-slate-600 font-medium">{selectedJob.location}</p>
                </div>
                <div className="flex gap-4 mt-8">
                  {/* ✅ UPDATE: Button toggle based on applied status */}
                  {appliedJobIds.includes(Number(selectedJob.id)) ? (
                    <button
                      className="bg-slate-200 text-slate-500 px-10 py-3.5 rounded-2xl font-black text-lg cursor-not-allowed flex items-center gap-2"
                      disabled
                    >
                      Applied <CheckCircle size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/apply/${selectedJob.id}`)} // Direct-ah logic panna koodathu, page navigate dhaan pannanum
                      className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:opacity-90 transition-all active:scale-95"
                    >
                      Apply Now
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveJob(selectedJob.id)}
                    className="bg-slate-100 p-4 rounded-2xl hover:bg-slate-200 transition-all text-slate-600"
                  >
                    <Bookmark />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="mb-10">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Job details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold text-xs uppercase flex items-center gap-2"><DollarSign size={14} /> Salary</p>
                      <p className="bg-green-50 text-green-700 font-black px-3 py-1 rounded-lg w-fit">{selectedJob.salary}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold text-xs uppercase flex items-center gap-2"><Briefcase size={14} /> Job Type</p>
                      <p className="bg-slate-100 text-slate-700 font-black px-3 py-1 rounded-lg w-fit">{selectedJob.type}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Full Job Description</h3>
                  <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedJob.description}</div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">Requirements</h3>
                  <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold italic">Select a job to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}