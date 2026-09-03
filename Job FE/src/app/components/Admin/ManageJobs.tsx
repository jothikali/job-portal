import { API } from '../../lib/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Edit, MapPin, Building2, Users,
    ChevronRight, TrendingUp, Briefcase, Clock
} from 'lucide-react';
import { toast } from '../../lib/toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    category: string;
    type: string;
    salary?: string;
}

interface FunnelStats {
    total:     number;
    screening: number;
    aptitude:  number;
    interview: number;
    hired:     number;
    rejected:  number;
}

// ─── Funnel bar component ─────────────────────────────────────────────────────
function FunnelBar({ stats }: { stats: FunnelStats }) {
    const { total, screening, aptitude, interview, hired } = stats;
    const passRate = total > 0 ? Math.round((hired / total) * 100) : 0;

    const stages = [
        { label: 'Screening',  value: screening,  color: 'bg-blue-400'    },
        { label: 'Aptitude',   value: aptitude,   color: 'bg-indigo-500'  },
        { label: 'Interview',  value: interview,  color: 'bg-purple-500'  },
        { label: 'Hired',      value: hired,      color: 'bg-emerald-500' },
    ];

    return (
        <div className="mt-4 space-y-3">
            {/* Stage stat grid */}
            <div className="grid grid-cols-5 gap-2">
                {/* Total */}
                <div className="col-span-1 bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-base font-black text-slate-800">{total}</p>
                </div>
                {stages.map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{s.label}</p>
                        <p className={`text-base font-black ${
                            s.label === 'Hired' ? 'text-emerald-600' : 'text-slate-700'
                        }`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Stacked horizontal bar */}
            {total > 0 ? (
                <div className="space-y-1.5">
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 gap-px">
                        {stages.map((s) => {
                            const pct = (s.value / total) * 100;
                            return pct > 0 ? (
                                <div
                                    key={s.label}
                                    className={`${s.color} transition-all duration-700`}
                                    style={{ width: `${pct}%` }}
                                    title={`${s.label}: ${s.value}`}
                                />
                            ) : null;
                        })}
                    </div>
                    {/* Legend + pass rate */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {stages.map((s) => (
                                <span key={s.label} className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                                    <span className={`size-2 rounded-full ${s.color}`} />
                                    {s.label}
                                </span>
                            ))}
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                            passRate >= 30 ? 'bg-emerald-50 text-emerald-700'
                            : passRate > 0  ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                            <TrendingUp size={10} />
                            Pass Rate: {passRate}%
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-[10px] text-slate-300 font-bold italic text-center py-1">
                    No applications yet
                </p>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ManageJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs]           = useState<Job[]>([]);
    const [funnel, setFunnel]       = useState<Record<number, FunnelStats>>({});
    const [loading, setLoading]     = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentJob, setCurrentJob]           = useState<any>(null);

    const fetchJobs = async () => {
        try {
            const [jobsRes, funnelRes] = await Promise.all([
                axios.get(`${API}/jobs`),
                axios.get(`${API}/admin/job-funnel-stats`),
            ]);
            setJobs(jobsRes.data);
            setFunnel(funnelRes.data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            toast.error("Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await axios.delete(`${API}/jobs/delete-job/${id}`);
                toast.success("Job deleted!");
                fetchJobs();
            } catch {
                toast.error("Failed to delete job!");
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-xl h-10 w-10 border-t-4 border-blue-600 border-r-4 border-r-transparent" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Jobs...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Jobs</h1>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{jobs.length} active listings</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 py-24 text-center">
                    <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Briefcase size={28} />
                    </div>
                    <p className="text-slate-400 font-black italic">No jobs found. Post one from the sidebar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {jobs.map((job) => {
                        const stats: FunnelStats = funnel[job.id] ?? {
                            total: 0, screening: 0, aptitude: 0,
                            interview: 0, hired: 0, rejected: 0,
                        };

                        return (
                            <div key={job.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col">

                                {/* Card header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Company avatar */}
                                        <div className="size-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-base shrink-0 uppercase">
                                            {job.company?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-base leading-tight">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                    <Building2 size={12} /> {job.company}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                    <MapPin size={12} /> {job.location}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-wider">
                                                    {job.category}
                                                </span>
                                                <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase tracking-wider border border-slate-100">
                                                    {job.type}
                                                </span>
                                                {stats.total > 0 && (
                                                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-wider">
                                                        <Users size={10} /> {stats.total} applied
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => { setCurrentJob({ ...job }); setIsEditModalOpen(true); }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Edit job"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete job"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Funnel analytics */}
                                <FunnelBar stats={stats} />

                                {/* View Applications CTA */}
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => navigate(`/admin/applications?jobId=${job.id}`)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group border border-slate-100 hover:border-blue-600"
                                    >
                                        <Users size={13} />
                                        View Applications
                                        <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentJob && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-slate-900 mb-6 italic text-center">Edit Job Details</h2>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Job Title</label>
                                <input type="text" value={currentJob.title}
                                    onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mt-1" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Company</label>
                                <input type="text" value={currentJob.company}
                                    onChange={(e) => setCurrentJob({ ...currentJob, company: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mt-1" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Location</label>
                                <input type="text" value={currentJob.location}
                                    onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Category</label>
                                    <input type="text" value={currentJob.category}
                                        onChange={(e) => setCurrentJob({ ...currentJob, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mt-1" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Type</label>
                                    <select value={currentJob.type}
                                        onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mt-1">
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 p-3 font-black text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await axios.put(`${API}/jobs/update-job/${currentJob.id}`, currentJob);
                                        toast.success("Job updated successfully!");
                                        setIsEditModalOpen(false);
                                        fetchJobs();
                                    } catch {
                                        toast.error("Update failed! Check backend connection.");
                                    }
                                }}
                                className="flex-1 bg-blue-600 text-white p-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobs;
