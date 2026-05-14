import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, FileText, CheckCircle, Mail, Briefcase, Zap, XCircle } from 'lucide-react';

const ApplicationDetails = ({ isOpen, onClose, application, onUpdate }: any) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !application) return null;

    // Logic to determine the next recruitment stage based on current status
    const getNextStage = (currentStatus: string) => {
        // String compare panna uppercase-ku maathikalam
        const status = currentStatus ? currentStatus.toUpperCase() : 'PENDING';

        switch (status) {
            case 'PENDING':
                return { label: 'Shortlisted', color: 'bg-cyan-500' };
            case 'SHORTLISTED':
                return { label: 'Aptitude Round', color: 'bg-blue-600' };
            case 'APTITUDE ROUND':
                return { label: 'Technical Interview', color: 'bg-indigo-600' };
            case 'TECHNICAL INTERVIEW':
                return { label: 'HR Discussion', color: 'bg-purple-600' };
            case 'HR DISCUSSION':
                return { label: 'Hired', color: 'bg-emerald-600' };
            default:
                return { label: 'Process Complete', color: 'bg-slate-500' };
        }
    };

    const nextStep = getNextStage(application.status);

    // UPDATED: Common function using axios.put to match your backend routes
    const handleUpdateStatus = async (newStatus: string, interviewDate: string | null, interviewTime: string | null) => {
        setIsUpdating(true);
        try {
            // Using .put as defined in your adminRoutes.js
            const res = await axios.put('http://localhost:5000/api/admin/update-round', {
                applicationId: application.id,
                status: newStatus,
                date: interviewDate,
                time: interviewTime
            });

            // Checking for success property from backend response
            if (res.data.success) {
                alert(`Success! Candidate moved to ${newStatus}`);
                onUpdate(); // Refresh the main list
                onClose();  // Close modal
            } else {
                alert("Update failed: " + res.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Update failed! Please check backend connection.");
        } finally {
            setIsUpdating(false);
        }
    };

    // APPROVE Logic
    const handleProcessCandidate = () => {
        if (!date || !time) return alert("Please select Interview Date and Time for the next round!");
        handleUpdateStatus(nextStep.label, date, time);
    };

    // REJECT Logic
    const handleRejectCandidate = () => {
        const confirmReject = window.confirm("Are you sure? This candidate will be marked as REJECTED.");
        if (confirmReject) {
            handleUpdateStatus('Rejected', null, null);
        }
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
                    <button onClick={onClose} className="bg-slate-50 size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl font-bold">&times;</button>
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

                {/* Skills Viewer */}
                <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1"><Zap size={12} className="text-yellow-500" /> Professional Skills</p>
                    <div className="flex flex-wrap gap-2">
                        {application.skills ? application.skills.split(',').map((skill: string) => (
                            <span key={skill} className="bg-white border border-slate-200 px-4 py-2 rounded-2xl text-[11px] font-bold text-slate-700 shadow-sm transition-hover hover:border-blue-300">
                                {skill.trim()}
                            </span>
                        )) : <p className="text-xs text-slate-400 italic">Skill details not provided</p>}
                    </div>
                </div>

                {/* PDF Resume Access */}
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
                                // Path-la 'resumes/' saethu kudukanum yenna file anga thaan irukku
                                const fileUrl = `http://localhost:5000/uploads/resumes/${application.resume_path}`;

                                console.log("Opening file from resumes folder:", fileUrl);
                                window.open(fileUrl, '_blank');
                            } else {
                                alert("Resume path not found!");
                            }
                        }}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                    >
                        View File
                    </button>
                </div>

                {/* Decision Panel (Approve or Reject) */}
                {application.status !== 'Hired' && application.status !== 'Rejected' && (
                    <div className="border-t border-slate-100 pt-8 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase italic">
                            <CheckCircle size={18} className="text-emerald-500" />
                            Eligibility Process: Schedule {nextStep.label}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Interview Date</label>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 ring-blue-100" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Interview Time</label>
                                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 ring-blue-100" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* REJECT BUTTON */}
                            <button
                                disabled={isUpdating}
                                onClick={handleRejectCandidate}
                                className="flex-1 py-5 rounded-[24px] border-2 border-red-100 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? '...' : 'Not Eligible'}
                            </button>

                            {/* APPROVE BUTTON */}
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

                {/* Visual indicator for already Rejected candidates */}
                {application.status === 'Rejected' && (
                    <div className="mt-4 p-6 bg-red-50 rounded-[32px] border border-red-100 text-center">
                        <p className="text-red-600 font-black uppercase italic text-sm">Application Rejected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationDetails;