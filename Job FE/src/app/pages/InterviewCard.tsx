import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, Calendar, CheckCircle2,
    ChevronRight, ClipboardList, RefreshCcw, Lock, AlertCircle, Download
} from 'lucide-react';
import jsPDF from 'jspdf';

interface InterviewProps {
    job: {
        id?: number;
        title: string;
        company: string;
        interview_date: string;
        interview_time: string;
        status: string;
        interview_link?: string;
    };
}

const InterviewCard: React.FC<InterviewProps> = ({ job }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<string>("Calculating...");
    const [isButtonActive, setIsButtonActive] = useState<boolean>(false);

    // --- UPDATED LOGIC START ---
    const currentStatus = job.status ? job.status.toUpperCase() : "";
    
    const isAptitude = currentStatus === "APPLIED" || currentStatus.includes("APTITUDE");
    const isTechnicalRound = currentStatus.includes("TECHNICAL") || currentStatus.includes("INTERVIEW") || currentStatus.includes("HR");
    const isHired = currentStatus === "HIRED"; // Added Hired logic
    const isAlreadyFinished = currentStatus === "FINISHED" || currentStatus === "COMPLETED" || isHired;
    // --- UPDATED LOGIC END ---

    // --- PDF GENERATION LOGIC ---
    const handleDownloadOffer = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo color
        doc.text("OFFER OF EMPLOYMENT", 105, 40, { align: 'center' });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);

        // Body
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Dear Candidate,`, 20, 80);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const message = `We are pleased to offer you the position of ${job.title} at ${job.company}. Following your performance in the selection process, we are excited to invite you to join our team. We believe your skills and experience will be a valuable asset to our organization.`;
        
        const splitMessage = doc.splitTextToSize(message, 170);
        doc.text(splitMessage, 20, 100);
        
        doc.setFont("helvetica", "bold");
        doc.text("Job Details:", 20, 140);
        doc.setFont("helvetica", "normal");
        doc.text(`Role: ${job.title}`, 30, 150);
        doc.text(`Company: ${job.company}`, 30, 160);
        doc.text("Joining Date: Immediate", 30, 170);
        
        doc.text("Congratulations on your new role!", 20, 200);
        
        doc.text("Best Regards,", 20, 220);
        doc.setFont("helvetica", "bold");
        doc.text(`${job.company} Recruitment Team`, 20, 230);

        doc.save(`${job.company}_Offer_Letter.pdf`);
    };

    useEffect(() => {
        const calculateTime = () => {
            try {
                if (isAlreadyFinished && !isHired) {
                    setTimeLeft("COMPLETED");
                    setIsButtonActive(false);
                    return;
                }
                
                if (isHired) {
                    setTimeLeft("SELECTED");
                    setIsButtonActive(true);
                    return;
                }

                const datePart = String(job.interview_date).split('T')[0];
                const [y, m, d] = datePart.split('-').map(Number);
                const [hrs, mins] = String(job.interview_time).split(':').map(Number);

                const targetDate = new Date(y, m - 1, d, hrs, mins, 0);
                const now = new Date();
                const distance = targetDate.getTime() - now.getTime();

                const openEarlyWindow = 300000; 
                const durationBuffer = 1800000; 

                if (distance > openEarlyWindow) {
                    const h = Math.floor(distance / (1000 * 60 * 60));
                    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((distance % (1000 * 60)) / 1000);

                    if (h > 24) setTimeLeft(`${Math.floor(h / 24)}d LEFT`);
                    else if (h > 0) setTimeLeft(`Starts in ${h}h ${m}m`);
                    else setTimeLeft(`Starts in ${m}m ${s}s`);

                    setIsButtonActive(false);
                } else if (distance <= openEarlyWindow && distance >= -durationBuffer) {
                    setTimeLeft("LIVE NOW");
                    setIsButtonActive(true);
                } else {
                    setTimeLeft("EXPIRED");
                    setIsButtonActive(false);
                }
            } catch (e) {
                setTimeLeft("SCHEDULED");
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [job.interview_date, job.interview_time, job.status, isAlreadyFinished, isHired]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const cleanDate = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const parts = cleanDate.split('-');
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return "--:--";
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const steps = ["APPLIED", "SHORTLISTED", "APTITUDE", "TECHNICAL", "HR"];

    return (
        <div className="group p-8 border border-slate-200 rounded-[50px] bg-white transition-all duration-500 shadow-sm hover:shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[620px]">
            <div className="relative z-10 flex items-center justify-between mb-8">
                <span className={`${isHired ? 'bg-emerald-500' : isAptitude ? 'bg-amber-500' : isTechnicalRound ? 'bg-indigo-600' : 'bg-slate-400'} text-white text-[9px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-lg`}>
                    {isHired ? 'STATUS: HIRED 🎉' : isAptitude ? 'PHASE 01: ASSESSMENT' : isTechnicalRound ? 'PHASE 02: INTERVIEW' : 'PHASE: PENDING'}
                </span>

                <div className="flex items-center gap-4">
                    <div className={`${isHired ? 'bg-emerald-500' : timeLeft === "LIVE NOW" ? 'bg-rose-500 animate-pulse' : (isAlreadyFinished || timeLeft === "COMPLETED") ? 'bg-emerald-500' : timeLeft === "EXPIRED" ? 'bg-slate-700' : 'bg-slate-800'} text-white text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 tracking-[0.1em]`}>
                        <div className={`w-1.5 h-1.5 bg-white rounded-full ${timeLeft === "LIVE NOW" ? 'animate-ping' : ''}`}></div>
                        {timeLeft}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-1">{job.title}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">@{job.company}</p>

                <div className="mb-8 bg-slate-50/80 p-6 rounded-[35px] border border-slate-100/50">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Selection Journey</p>
                        <p className="text-[9px] font-bold text-indigo-600 uppercase">
                            {isHired ? 'Completed' : `Step ${steps.findIndex(s => currentStatus.includes(s)) + 1} of 5`}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                        {steps.map((step, index) => {
                            const activeIndex = steps.findIndex(s => currentStatus.includes(s));
                            const isActive = index === activeIndex && !isHired;
                            const isDone = index < activeIndex || isAlreadyFinished || isHired;
                            return (
                                <React.Fragment key={step}>
                                    <div className={`text-[8px] font-black px-3 py-2 rounded-xl transition-all duration-500 flex items-center gap-1 ${isActive ? 'bg-indigo-600 text-white shadow-xl scale-110' : isDone ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                        {isDone && <CheckCircle2 size={10} />} {step}
                                    </div>
                                    {index < steps.length - 1 && <ChevronRight size={10} className="text-slate-200" />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className={`mb-8 p-5 rounded-3xl border-2 border-dashed flex gap-4 ${isHired ? 'bg-emerald-50 border-emerald-100' : isAptitude ? 'bg-amber-50/40 border-amber-100' : 'bg-blue-50/40 border-blue-100'}`}>
                    <div className={`p-2.5 rounded-2xl h-fit ${isHired ? 'bg-emerald-500 text-white' : isAptitude ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {isHired ? <CheckCircle2 size={20} /> : <ClipboardList size={20} />}
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-1 flex items-center gap-2">
                            {isHired ? 'Onboarding Guide' : 'Instructional Guide'} <AlertCircle size={12} />
                        </p>
                        <ul className="text-[10px] text-slate-500 font-bold list-disc ml-4 italic leading-relaxed">
                            {isHired ? (
                                <>
                                    <li>Download your official offer letter below.</li>
                                    <li>Wait for the HR onboarding email.</li>
                                    <li>Keep your documents ready for verification.</li>
                                </>
                            ) : isAptitude ? (
                                <>
                                    <li>Tab switching will auto-submit the test.</li>
                                    <li>Ensure stable internet connection.</li>
                                    <li>Test duration: 15 Minutes.</li>
                                </>
                            ) : (
                                <>
                                    <li>Join the meeting 5 mins early.</li>
                                    <li>Keep your video and audio enabled.</li>
                                    <li>Keep your ID proof ready.</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                        <Calendar className="text-indigo-600" size={20} />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Date</p>
                            <p className="text-xs font-black text-slate-700 uppercase">{formatDate(job.interview_date)}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                        <Clock className="text-indigo-600" size={20} />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Start Time</p>
                            <p className="text-xs font-black text-slate-700 uppercase">{formatTime(job.interview_time)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-8">
                <div className="flex flex-col">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                    <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-widest mb-3 ${isHired ? 'text-indigo-600' : isAlreadyFinished ? 'text-emerald-500' : 'text-emerald-500'}`}>
                        {isHired || isAlreadyFinished ? <CheckCircle2 size={18} /> : <RefreshCcw size={18} className={timeLeft === "LIVE NOW" ? "animate-spin-slow" : ""} />}
                        {isHired ? "HIRED" : isAlreadyFinished ? "FINISHED" : currentStatus}
                    </div>
                </div>

                {isHired ? (
                    <button
                        onClick={handleDownloadOffer}
                        className="px-8 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse">
                        <Download size={14} /> Download Offer
                    </button>
                ) : (
                    <button
                        disabled={!isButtonActive || isAlreadyFinished}
                        onClick={() => {
                            if (isAptitude) {
                                navigate(`/aptitude-test/${job.id}`);
                            } else if (isTechnicalRound) {
                                window.open(job.interview_link, '_blank');
                            }
                        }}
                        className={`px-10 py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center gap-3 ${(!isButtonActive || isAlreadyFinished) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : isAptitude ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'}`}>
                        {(!isButtonActive || isAlreadyFinished) && <Lock size={14} />}
                        {isAlreadyFinished ? "COMPLETED" : 
                         timeLeft === "EXPIRED" ? "CLOSED" : 
                         isAptitude ? "START ASSESSMENT" : 
                         isTechnicalRound ? "JOIN MEETING" : "LOCKED"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InterviewCard;