import { API } from '../../lib/api';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApplicationDetails from './ApplicationDetails';
import { X, CheckSquare, Square, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from '../../lib/toast';

interface Application {
    id: number;
    fullName: string;
    email: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    skills?: string;
    required_skills?: string;
    status_history?: string;
    job_id?: number;
}

function calcMatch(candidateSkills?: string, requiredSkills?: string): number | null {
    if (!requiredSkills) return null;
    const required = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (required.length === 0) return null;
    const candidate = (candidateSkills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const matched = required.filter(r => candidate.includes(r)).length;
    return Math.round((matched / required.length) * 100);
}

const BULK_STAGES = ['Shortlisted', 'Aptitude Round', 'Technical Interview', 'HR Discussion', 'Hired', 'Rejected'];

const Applications = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const jobIdFilter = searchParams.get('jobId');

    const [applications, setApplications]   = useState<Application[]>([]);
    const [loading, setLoading]             = useState(true);
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [selectedApp, setSelectedApp]     = useState<Application | null>(null);
    const [searchTerm, setSearchTerm]       = useState("");

    // ── Bulk select state ────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
    const [bulkStage, setBulkStage]         = useState('');
    const [bulkLoading, setBulkLoading]     = useState(false);
    const [showBulkMenu, setShowBulkMenu]   = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/admin/applications`);
            const data = await response.json();
            setApplications(Array.isArray(data) ? data : (data.data || []));
        } catch (error) { console.error("Fetch Error:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApplications(); }, []);

    const jobFiltered = jobIdFilter
        ? applications.filter(app => String(app.job_id) === jobIdFilter)
        : applications;

    const filteredApps = jobFiltered.filter(app =>
        app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobTitle = jobIdFilter && applications.length > 0
        ? applications.find(a => String(a.job_id) === jobIdFilter)?.jobTitle ?? `Job #${jobIdFilter}`
        : null;

    const clearFilter = () => setSearchParams({});

    // ── Bulk helpers ─────────────────────────────────────────────────────────
    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredApps.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredApps.map(a => a.id)));
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStage) { toast.warn("Select a target stage first."); return; }
        if (selectedIds.size === 0) { toast.warn("Select at least one candidate."); return; }
        setBulkLoading(true);
        try {
            await axios.post(`${API}/admin/bulk-update-status`, {
                applicationIds: Array.from(selectedIds),
                newStatus: bulkStage,
            });
            toast.success(`${selectedIds.size} candidate(s) moved to ${bulkStage}`);
            setSelectedIds(new Set());
            setBulkStage('');
            setShowBulkMenu(false);
            fetchApplications();
        } catch { toast.error("Bulk update failed."); }
        finally { setBulkLoading(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-slate-500 font-bold italic">Loading Job Applications...</p>
        </div>
    );

    const allSelected = filteredApps.length > 0 && selectedIds.size === filteredApps.length;

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Recent Applications</h2>
                        <p className="text-xs text-slate-400 font-medium">Manage and review incoming job requests</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        <input type="text" placeholder="Search candidate..."
                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 flex-1 md:w-48"
                            onChange={(e) => setSearchTerm(e.target.value)} />
                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap">
                            {filteredApps.length} TOTAL
                        </span>
                    </div>
                </div>

                {/* Active job filter banner */}
                {filteredJobTitle && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
                        <p className="text-xs font-black text-blue-700 uppercase tracking-wide">
                            Filtered: <span className="text-blue-900">{filteredJobTitle}</span>
                            <span className="ml-2 text-blue-500 font-bold normal-case">({filteredApps.length} applicants)</span>
                        </p>
                        <button onClick={clearFilter} className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-red-500 uppercase tracking-widest transition-colors">
                            <X size={12} /> Clear
                        </button>
                    </div>
                )}

                {/* ── Bulk action bar — shown when rows are selected ── */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex-wrap">
                        <span className="text-xs font-black text-indigo-700">{selectedIds.size} selected</span>
                        <div className="relative">
                            <button onClick={() => setShowBulkMenu(!showBulkMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-black text-indigo-700 hover:bg-indigo-50 transition-all">
                                {bulkStage || 'Move to stage'} <ChevronDown size={12} />
                            </button>
                            {showBulkMenu && (
                                <div className="absolute left-0 top-10 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden w-52">
                                    {BULK_STAGES.map(s => (
                                        <button key={s} onClick={() => { setBulkStage(s); setShowBulkMenu(false); }}
                                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 transition-colors">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleBulkUpdate} disabled={!bulkStage || bulkLoading}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95">
                            {bulkLoading ? 'Updating...' : 'Apply'}
                        </button>
                        <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[10px] text-slate-400 hover:text-red-500 font-black uppercase">
                            Clear
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                {/* ── DESKTOP TABLE ── */}
                <table className="hidden md:table w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            {/* Select all checkbox */}
                            <th className="pl-6 py-5 w-10">
                                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                    {allSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Job Applied</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Skills Match</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredApps.length > 0 ? (
                            filteredApps.map((application) => {
                                const matchPct = calcMatch(application.skills, application.required_skills);
                                const isSelected = selectedIds.has(application.id);
                                return (
                                    <tr key={application.id} className={`transition-colors group ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
                                        <td className="pl-6 py-6">
                                            <button onClick={() => toggleSelect(application.id)} className="text-slate-300 hover:text-indigo-600 transition-colors">
                                                {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase shrink-0">
                                                    {application.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{application.fullName || 'Unknown'}</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-1">{application.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <p className="text-sm font-bold text-slate-700">{application.jobTitle || 'General Application'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider italic">
                                                Applied {new Date(application.appliedAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-6">
                                            {matchPct !== null ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${matchPct >= 70 ? 'bg-emerald-500' : matchPct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${matchPct}%` }} />
                                                        </div>
                                                        <span className={`text-[10px] font-black ${matchPct >= 70 ? 'text-emerald-600' : matchPct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{matchPct}%</span>
                                                    </div>
                                                    <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-tight ${matchPct >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : matchPct >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                        {matchPct >= 70 ? 'Strong' : matchPct >= 40 ? 'Partial' : 'Low'}
                                                    </span>
                                                </div>
                                            ) : <span className="text-[10px] text-slate-300 font-bold italic">N/A</span>}
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${application.status === 'Pending' ? 'bg-orange-50 text-orange-600' : application.status === 'Hired' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {application.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <button onClick={() => { setSelectedApp(application); setIsModalOpen(true); }}
                                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-blue-700 transition-all active:scale-95">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-bold italic">No applications matching your search.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* ── MOBILE CARD STACK ── */}
                <div className="md:hidden divide-y divide-slate-50">
                    {filteredApps.length > 0 ? filteredApps.map((application) => {
                        const matchPct = calcMatch(application.skills, application.required_skills);
                        const isSelected = selectedIds.has(application.id);
                        return (
                            <div key={application.id} className={`p-4 transition-colors ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <button onClick={() => toggleSelect(application.id)} className="text-slate-300 hover:text-indigo-600 shrink-0">
                                        {isSelected ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                                    </button>
                                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600 uppercase shrink-0">
                                        {application.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">{application.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500 truncate">{application.email}</p>
                                    </div>
                                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${application.status === 'Pending' ? 'bg-orange-50 text-orange-600' : application.status === 'Hired' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {application.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-600">{application.jobTitle}</p>
                                        <p className="text-[10px] text-slate-400">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
                                        {matchPct !== null && (
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${matchPct >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : matchPct >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {matchPct}%
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => { setSelectedApp(application); setIsModalOpen(true); }}
                                        className="shrink-0 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-blue-700 transition-all active:scale-95 ml-3">
                                        View
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="p-12 text-center text-slate-400 font-bold italic text-sm">No applications found.</div>
                    )}
                </div>
            </div>

            {selectedApp && (
                <ApplicationDetails
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedApp(null); }}
                    application={selectedApp}
                    onUpdate={fetchApplications}
                />
            )}
        </div>
    );
};

export default Applications;
