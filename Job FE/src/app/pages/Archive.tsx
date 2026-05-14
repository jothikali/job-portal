import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Archive as ArchiveIcon, Briefcase, Calendar } from 'lucide-react';

interface ArchivedJob {
    id: number;
    title: string;
    company: string;
    status: string;
    applied_date: string;
    interview_date?: string;
    interview_time?: string;
}

const ArchivePage = () => {
    const [archivedJobs, setArchivedJobs] = useState<ArchivedJob[]>([]);
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { id: 1 };

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                // Using applied-jobs endpoint because standard archive endpoint might filter out 'interview' status
                const res = await axios.get(`http://localhost:5000/api/jobs/applied-jobs/${user.id}`);
                const allData = Array.isArray(res.data) ? res.data : [];
                const now = new Date();

                const archivedOnly = allData.filter((job: any) => {
                    const s = job?.status?.toLowerCase();
                    const interviewDateTime = job.interview_date && job.interview_time 
                        ? new Date(`${job.interview_date.split('T')[0]}T${job.interview_time}`)
                        : null;

                    const isStandardArchive = ['completed', 'rejected', 'withdrawn'].includes(s);
                    const isPastInterview = s === 'interview' && interviewDateTime && interviewDateTime < now;

                    return isStandardArchive || isPastInterview;
                });

                setArchivedJobs(archivedOnly);
            } catch (err) {
                console.error("Error fetching archive:", err);
            }
        };
        if (user.id) fetchArchive();
    }, [user.id]);

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <ArchiveIcon size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Archive Storage</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">History of completed or closed applications</p>
                </div>
            </div>

            {archivedJobs.length === 0 ? (
                <div className="bg-white p-12 rounded-[35px] border border-dashed border-slate-300 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No archived applications found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedJobs.map((job: any) => {
                        const isInterviewStatus = job.status?.toLowerCase() === 'interview';
                        const displayStatus = isInterviewStatus ? 'Completed' : job.status;

                        return (
                            <div key={job.id} className="bg-white p-6 rounded-[35px] border border-slate-200 opacity-90 hover:opacity-100 transition-opacity group shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Briefcase size={20} className="text-slate-400 group-hover:text-indigo-400" />
                                    </div>
                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                        displayStatus?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-600' :
                                        displayStatus?.toLowerCase() === 'withdrawn' ? 'bg-slate-200 text-slate-600' :
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {displayStatus}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{job.title}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-6">{job.company}</p>

                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter pt-4 border-t border-slate-50">
                                    <Calendar size={14} />
                                    <span>Applied on: {new Date(job.applied_date).toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ArchivePage;