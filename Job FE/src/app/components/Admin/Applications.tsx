import React, { useEffect, useState } from 'react';
import ApplicationDetails from './ApplicationDetails';

// 1. Types define pannalam (Better for Pro Portfolio)
interface Application {
    id: number;
    fullName: string;
    email: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    skills?: string;
}

const Applications = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/applications');
            const data = await response.json();
            
            // Backend structure-ku yetha maari data set panrom
            const appsData = Array.isArray(data) ? data : (data.data || []);
            setApplications(appsData);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // 2. Search Filter Logic
    const filteredApps = applications.filter(app => 
        app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-bold italic">Loading Job Applications...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Header with Search */}
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Recent Applications</h2>
                    <p className="text-xs text-slate-400 font-medium">Manage and review incoming job requests</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="text"
                        placeholder="Search candidate..."
                        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap">
                        {filteredApps.length} TOTAL
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Job Applied</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredApps.length > 0 ? (
                            filteredApps.map((application) => (
                                <tr key={application.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
                                                {application.fullName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight">{application.fullName || 'Unknown'}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">{application.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{application.jobTitle || 'General Application'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider italic">
                                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight 
                                            ${application.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                              application.status === 'Hired' ? 'bg-emerald-50 text-emerald-600' :
                                              application.status === 'TECHNICAL ROUND' ? 'bg-purple-50 text-purple-600' :
                                              'bg-blue-50 text-blue-600'}`}>
                                            {application.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedApp(application);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic">
                                    No applications matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedApp && (
                <ApplicationDetails
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApp(null);
                    }}
                    application={selectedApp}
                    onUpdate={fetchApplications}
                />
            )}
        </div>
    );
};

export default Applications;