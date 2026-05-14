import { useState, useEffect } from "react";
import {
    MoreVertical, Edit3, Trash2, Eye,
    Search, Filter, Plus, CheckCircle, Clock
} from "lucide-react";
interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    category: string;
    salary?: string; // Optional-ah vachukalaam
    type?: string;
}

export function AdminJobs() {
    // 2. State-ku "Job[]" type-ah kudunga
    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    // UI-la irundhu andha job-ah mattum remove panna
                    setJobs(jobs.filter(job => job.id !== id));
                    alert("Job Deleted successfully! 🗑️");
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };
    
    // Fetching jobs from your MySQL Backend
    useEffect(() => {
        fetch("http://localhost:5000/api/jobs")
            .then(res => res.json())
            .then(data => setJobs(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* --- TOP HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Jobs</h1>
                    <p className="text-sm font-bold text-slate-400">Total {jobs.length} jobs posted so far</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    <Plus size={20} /> Post New Job
                </button>
            </div>

            {/* --- FILTERS & SEARCH --- */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or company..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-blue-600 outline-none font-bold text-slate-600 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl font-black border border-transparent hover:border-slate-200 transition-all">
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* --- THE MODERN TABLE --- */}
            <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Job Details</th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Applicants</th>
                            <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {jobs.map((job) => (
                            <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-700">{job.title}</p>
                                            <p className="text-xs font-bold text-slate-400">{job.company} • {job.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-slate-500">{job.category}</td>
                                <td className="px-8 py-6">
                                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase border border-green-100 w-fit">
                                        <CheckCircle size={12} /> Active
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200"></div>
                                        ))}
                                        <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">+12</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button title="View" className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-md transition-all">
                                            <Eye size={18} />
                                        </button>
                                        <button title="Edit" className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 hover:shadow-md transition-all">
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:shadow-md transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {jobs.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-slate-300" size={32} />
                        </div>
                        <p className="font-black text-slate-400">No jobs found. Start by posting one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}