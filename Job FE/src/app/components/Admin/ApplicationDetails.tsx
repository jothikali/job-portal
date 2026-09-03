import { API, UPLOADS } from '../../lib/api';
import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, FileText, CheckCircle, Mail, Briefcase, Zap, Gift, History } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '../../lib/toast';

// ─── Stage rules ─────────────────────────────────────────────────────────────
const STAGES_REQUIRE_SCHEDULE = ['TECHNICAL INTERVIEW', 'HR DISCUSSION'];
const STAGES_OPTIONAL_SCHEDULE = ['APTITUDE ROUND'];
const STAGES_HIRED = ['HIRED', 'OFFER RELEASED'];

// ─── Skills match helper ──────────────────────────────────────────────────────
function calcMatch(candidateSkills?: string, requiredSkills?: string): number | null {
    if (!requiredSkills) return null;
    const required = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (required.length === 0) return null;
    const candidate = (candidateSkills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const matched = required.filter(r => candidate.includes(r)).length;
    return Math.round((matched / required.length) * 100);
}

// ─── Audit history timeline ───────────────────────────────────────────────────
interface HistoryEntry { status: string; timestamp: string; }

function AuditTimeline({ raw }: { raw?: string }) {
    let entries: HistoryEntry[] = [];
    try { entries = raw ? JSON.parse(raw) : []; } catch { entries = []; }
    if (entries.length === 0) return (
        <p className="text-xs text-slate-400 italic">No stage transitions recorded yet.</p>
    );
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
    return (
        <div className="relative ml-3 space-y-0">
            {entries.map((entry, idx) => (
                <div key={idx} className="relative flex gap-4 pb-5">
                    {/* Vertical connector line */}
                    {idx < entries.length - 1 && (
                        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100" />
                    )}
                    {/* Dot */}
                    <div className={`mt-0.5 size-4 rounded-full ${dotColor(entry.status)} shrink-0 shadow-sm ring-2 ring-white`} />
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-tight">
                            {entry.status}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{entry.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

const ApplicationDetails = ({ isOpen, onClose, application, onUpdate }: any) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !application) return null;

    const currentStatus = application.status ? application.status.toUpperCase() : 'PENDING';

    // ─── Next stage mapping ───────────────────────────────────────────────────
    const getNextStage = (status: string) => {
        switch (status) {
            case 'PENDING':          return { label: 'Shortlisted',          color: 'bg-cyan-500' };
            case 'SHORTLISTED':      return { label: 'Aptitude Round',        color: 'bg-blue-600' };
            case 'APTITUDE ROUND':   return { label: 'Technical Interview',   color: 'bg-indigo-600' };
            case 'TECHNICAL INTERVIEW': return { label: 'HR Discussion',      color: 'bg-purple-600' };
            case 'HR DISCUSSION':    return { label: 'Hired',                 color: 'bg-emerald-600' };
            default:                 return { label: 'Process Complete',      color: 'bg-slate-500' };
        }
    };

    const nextStep = getNextStage(currentStatus);

    // ─── Picker visibility flags ──────────────────────────────────────────────
    // nextStep.label tells us what stage we are MOVING TO after clicking Approve
    const movingToStatus = nextStep.label.toUpperCase();
    const showRequiredPickers  = STAGES_REQUIRE_SCHEDULE.includes(movingToStatus);
    const showOptionalPickers  = STAGES_OPTIONAL_SCHEDULE.includes(movingToStatus);
    const showPickers          = showRequiredPickers || showOptionalPickers;
    const isHiredStage         = STAGES_HIRED.includes(currentStatus);
    const isRejectedStage      = currentStatus === 'REJECTED';
    const showDecisionPanel    = !isHiredStage && !isRejectedStage;

    // ─── API helpers ──────────────────────────────────────────────────────────
    const handleUpdateStatus = async (
        newStatus: string,
        interviewDate: string | null,
        interviewTime: string | null
    ) => {
        setIsUpdating(true);
        try {
            const res = await axios.put(`${API}/admin/update-round`, {
                applicationId: application.id,
                status: newStatus,
                date: interviewDate,
                time: interviewTime,
            });

            if (res.data.success) {
                toast.success(`Candidate moved to ${newStatus}`);
                onUpdate();
                onClose();
            } else {
                toast.error('Update failed: ' + res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Update failed! Please check backend connection.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Approve — validate date/time only when pickers are required
    const handleProcessCandidate = () => {
        if (showRequiredPickers && (!date || !time)) {
            toast.warn(`Please select Interview Date and Time before moving to ${nextStep.label}.`);
            return;
        }
        handleUpdateStatus(nextStep.label, date || null, time || null);
    };

    // Reject
    const handleRejectCandidate = () => {
        if (window.confirm('Are you sure? This candidate will be marked as REJECTED.')) {
            handleUpdateStatus('Rejected', null, null);
        }
    };

    // Offer letter PDF generation + status update to "Offer Released"
    const handleReleaseOffer = () => {
        const doc = new jsPDF();

        // Sidebar accent
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 15, 297, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.setTextColor(15, 23, 42);
        doc.text((application.jobTitle || 'Company').toUpperCase(), 25, 35);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('OFFICIAL LETTER OF APPOINTMENT', 25, 42);

        doc.setDrawColor(226, 232, 240);
        doc.line(25, 50, 195, 50);

        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, 65);
        doc.text(`Ref: HR/OFFER/${application.id}/SEC-A`, 25, 72);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(`Dear ${application.fullName || 'Candidate'},`, 25, 90);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const body = `Following your recent interview and selection process, we are delighted to offer you the position of ${application.jobTitle} at our organisation. We were impressed with your skills and believe you will contribute significantly to our mission.`;
        doc.text(doc.splitTextToSize(body, 165), 25, 100);

        // Details box
        doc.setFillColor(248, 250, 252);
        doc.rect(25, 130, 165, 50, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.rect(25, 130, 165, 50, 'S');

        doc.setFont('helvetica', 'bold');
        doc.text('EMPLOYMENT DETAILS', 107, 138, { align: 'center' });
        doc.line(80, 140, 135, 140);
        doc.text('Role:', 35, 152);
        doc.setFont('helvetica', 'normal');
        doc.text(`${application.jobTitle}`, 85, 152);
        doc.setFont('helvetica', 'bold');
        doc.text('Candidate:', 35, 162);
        doc.setFont('helvetica', 'normal');
        doc.text(`${application.fullName}`, 85, 162);
        doc.setFont('helvetica', 'bold');
        doc.text('Joining Date:', 35, 172);
        doc.setFont('helvetica', 'normal');
        doc.text('Immediate / As discussed', 85, 172);

        const closing = `Please confirm your acceptance within 48 hours by replying to the HR email. We look forward to welcoming you to the team.`;
        doc.text(doc.splitTextToSize(closing, 165), 25, 200);

        doc.setFont('helvetica', 'bold');
        doc.text('Sincerely,', 25, 240);
        doc.text('Head of Talent Acquisition', 25, 260);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Note: System-generated document. No physical signature required.', 105, 285, { align: 'center' });

        doc.save(`OfferLetter_${application.fullName || 'Candidate'}.pdf`);

        // Mark as Offer Released in backend
        handleUpdateStatus('Offer Released', null, null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Review & Decision</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">ID: #{application.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-50 size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                {/* Candidate & Job Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Candidate Name</p>
                            <h3 className="text-md font-bold text-slate-900">{application.fullName}</h3>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
                            <h3 className="text-sm font-bold text-slate-600">{application.email}</h3>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-400 uppercase mb-1 flex items-center gap-1"><Briefcase size={10} /> Position</p>
                            <h3 className="text-md font-bold text-blue-900">{application.jobTitle}</h3>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Round</p>
                            <span className="text-xs font-black px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-600 uppercase italic">
                                {application.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" /> Professional Skills
                    </p>
                    {/* Skills Match badge */}
                    {(() => {
                        const pct = calcMatch(application.skills, application.required_skills);
                        if (pct === null) return null;
                        const color = pct >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : pct >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-red-50 border-red-200 text-red-600';
                        const label = pct >= 70 ? 'Strong Match' : pct >= 40 ? 'Partial Match' : 'Low Match';
                        return (
                            <div className={`flex items-center gap-3 mb-3 px-4 py-3 rounded-2xl border ${color}`}>
                                <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs font-black whitespace-nowrap">{pct}% — {label}</span>
                            </div>
                        );
                    })()}
                    <div className="flex flex-wrap gap-2">
                        {application.skills
                            ? application.skills.split(',').map((skill: string) => (
                                <span key={skill} className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-[11px] font-bold text-slate-700 shadow-sm hover:border-blue-300 transition-all">
                                    {skill.trim()}
                                </span>
                            ))
                            : <p className="text-xs text-slate-400 italic">Skill details not provided</p>
                        }
                    </div>
                </div>

                {/* Resume */}
                <div className="mb-8 p-6 bg-slate-900 rounded-[32px] flex items-center justify-between border border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm italic">Eligibility Document</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-tighter italic">Resume.pdf</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (application.resume_path) {
                                window.open(`${UPLOADS}/resumes/${application.resume_path}`, '_blank');
                            } else {
                                toast.error('Resume path not found!');
                            }
                        }}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                    >
                        View File
                    </button>
                </div>

                {/* ─── Decision Panel ─────────────────────────────────────────── */}

                {/* HIRED / OFFER RELEASED — only show Release Offer button */}
                {isHiredStage && (
                    <div className="border-t border-slate-100 pt-8">
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase italic mb-6">
                            <CheckCircle size={18} className="text-emerald-500" />
                            Candidate Selected — Release Offer Letter
                        </div>
                        <button
                            disabled={isUpdating}
                            onClick={handleReleaseOffer}
                            className="w-full py-5 rounded-[24px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            <Gift size={18} />
                            {isUpdating ? 'Releasing...' : 'Release Offer Letter'}
                        </button>
                    </div>
                )}

                {/* Active stages — scheduling + approve/reject */}
                {showDecisionPanel && (
                    <div className="border-t border-slate-100 pt-8 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase italic">
                            <CheckCircle size={18} className="text-emerald-500" />
                            Eligibility Process: Schedule {nextStep.label}
                        </div>

                        {/* Date & Time pickers — shown only for stages that need scheduling */}
                        {showPickers && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1">
                                        <Calendar size={10} />
                                        {showRequiredPickers ? 'Interview Date *' : 'Interview Date (Optional)'}
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 ring-blue-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1">
                                        <Clock size={10} />
                                        {showRequiredPickers ? 'Interview Time *' : 'Interview Time (Optional)'}
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 ring-blue-100"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Helper note for optional scheduling */}
                        {showOptionalPickers && (
                            <p className="text-[10px] text-slate-400 font-bold italic ml-1">
                                * Date &amp; Time are optional for Aptitude Round. Leave blank to skip scheduling.
                            </p>
                        )}

                        <div className="flex gap-4">
                            <button
                                disabled={isUpdating}
                                onClick={handleRejectCandidate}
                                className="flex-1 py-5 rounded-[24px] border-2 border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? '...' : 'Not Eligible'}
                            </button>
                            <button
                                disabled={isUpdating}
                                onClick={handleProcessCandidate}
                                className={`flex-[2] py-5 rounded-[24px] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 ${nextStep.color}`}
                            >
                                {isUpdating ? 'Processing...' : `Approve & Move to ${nextStep.label}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Rejected state */}
                {isRejectedStage && (
                    <div className="mt-4 p-6 bg-red-50 rounded-[32px] border border-red-100 text-center">
                        <p className="text-red-600 font-black uppercase italic text-sm">Application Rejected</p>
                    </div>
                )}

                {/* ─── Audit History Timeline ─────────────────────────────── */}
                <div className="mt-8 border-t border-slate-100 pt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-5 flex items-center gap-2">
                        <History size={13} className="text-slate-400" /> Stage History
                    </p>
                    <AuditTimeline raw={application.status_history} />
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetails;
