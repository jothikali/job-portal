import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit, MapPin, Building2 } from 'lucide-react';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState<any>(null);

    // 1. Fetch all jobs from database
    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // 2. Delete job function
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/delete-job/${id}`);
                alert("Job Deleted!");
                fetchJobs(); // Table-ah refresh panna thirumba fetch pandroam
            } catch (err) {
                alert("Delete panna mudiyala!");
            }
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Jobs...</div>;

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Job Details</th>
                        <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                        <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                        <th className="p-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {jobs.map((job: any) => (
                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-6">
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-base">{job.title}</span>
                                    <div className="flex items-center gap-3 mt-1 text-slate-400">
                                        <span className="flex items-center gap-1 text-xs font-bold"><Building2 size={14} /> {job.company}</span>
                                        <span className="flex items-center gap-1 text-xs font-bold"><MapPin size={14} /> {job.location}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                    {job.category}
                                </span>
                            </td>
                            <td className="p-6">
                                <span className="text-sm font-bold text-slate-600 capitalize">{job.type}</span>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Parent row click aagama thadukkum
                                            console.log("Edit Clicked for job:", job);
                                            setCurrentJob({ ...job }); // Spread operator use panni clone pannunga
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
                <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold italic">No jobs found in the database.</p>
                </div>
            )}
            {isEditModalOpen && currentJob && (
               <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 italic text-center">Edit Job Details</h2>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            {/* Job Title */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Job Title</label>
                                <input
                                    type="text"
                                    value={currentJob.title}
                                    onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Company</label>
                                <input
                                    type="text"
                                    value={currentJob.company}
                                    onChange={(e) => setCurrentJob({ ...currentJob, company: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Location</label>
                                <input
                                    type="text"
                                    value={currentJob.location}
                                    onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Category</label>
                                    <input
                                        type="text"
                                        value={currentJob.category}
                                        onChange={(e) => setCurrentJob({ ...currentJob, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                {/* Job Type */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Type</label>
                                    <select
                                        value={currentJob.type}
                                        onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 p-3 font-black text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await axios.put(`http://localhost:5000/api/jobs/update-job/${currentJob.id}`, currentJob);
                                        alert("Job Updated Successfully! 🚀");
                                        setIsEditModalOpen(false);
                                        fetchJobs();
                                    } catch (err) {
                                        console.error(err);
                                        alert("Update panna mudiyala, backend-ah check pannunga!");
                                    }
                                }}
                                className="flex-1 bg-blue-600 text-white p-3 rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageJobs;