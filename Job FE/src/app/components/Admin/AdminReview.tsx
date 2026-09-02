import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CheckCircle, XCircle, User, Award, 
    Search, Clock, Mail, ArrowUpRight, AlertCircle, Calendar, X
} from 'lucide-react';
import { toast } from '../../lib/toast';

interface Candidate {
    id: number;
    name: string;
    email: string;
    aptitude_score: number;
    status: string;
    answers_json?: string;
    submitted_at?: string;
}

const AdminReview = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    // Custom Modal States
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [candRes, questRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/aptitude/admin/results'),
                    axios.get('http://localhost:5000/api/aptitude/questions')
                ]);
                setCandidates(candRes.data);
                setQuestions(questRes.data);
            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Function to handle Final API Call
    const handleFinalAction = async (status: string) => {
        if (status === 'TECHNICAL ROUND' && (!interviewDate || !interviewTime)) {
            toast.warn("Please select both Interview Date and Time!");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/admin/update-round`, {
                applicationId: selectedCandidate?.id,
                status: status,
                date: status === 'TECHNICAL ROUND' ? interviewDate : null,
                time: status === 'TECHNICAL ROUND' ? interviewTime : null
            });

            if (res.data.success) {
                toast.success(`Candidate moved to ${status}`);
                setCandidates(prev => prev.filter(c => c.id !== selectedCandidate?.id));
                closeAllModals();
            }
        } catch (err) {
            console.error("Update Error:", err);
            toast.error("Update failed. Check backend connection.");
        }
    };

    const closeAllModals = () => {
        setSelectedCandidate(null);
        setShowScheduleModal(false);
        setInterviewDate("");
        setInterviewTime("");
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans relative">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
                        Assessment <span className="text-indigo-600">Review</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Evaluate Candidate Performance</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[20px] w-full md:w-[400px] shadow-sm outline-none font-bold text-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="max-w-6xl mx-auto space-y-4">
                {loading ? (
                    <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse">Loading...</div>
                ) : (
                    filteredCandidates.map((c) => (
                        <div key={c.id} className="bg-white p-6 rounded-[30px] border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-800">{c.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCandidate(c)}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                            >
                                Review Details
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* MAIN REVIEW MODAL */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase italic">{selectedCandidate.name} - Test Results</h2>
                            <button onClick={closeAllModals} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 space-y-6">
                            {questions.map((q, idx) => {
                                const userAns = JSON.parse(selectedCandidate.answers_json || "{}")[q.id];
                                const isCorrect = userAns === q.correct_option;
                                return (
                                    <div key={q.id} className={`p-6 rounded-[25px] border-2 bg-white ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
                                        <p className="font-bold text-slate-800 mb-2">Q{idx + 1}: {q.question}</p>
                                        <div className="text-xs font-black uppercase tracking-widest flex gap-4">
                                            <span className={isCorrect ? "text-emerald-500" : "text-rose-500"}>User: {userAns || "N/A"}</span>
                                            <span className="text-slate-400">Correct: {q.correct_option}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-8 bg-white border-t flex justify-end gap-4">
                            <button 
                                onClick={() => handleFinalAction('REJECTED')}
                                className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => setShowScheduleModal(true)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-lg transition-all"
                            >
                                Approve Interview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM INTERVIEW SCHEDULER POPUP */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-indigo-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-8 rounded-[35px] shadow-2xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Calendar size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 italic uppercase">Schedule Technical</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">For {selectedCandidate?.name}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-2 block">Interview Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500"
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-2 block">Interview Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500"
                                    onChange={(e) => setInterviewTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button 
                                onClick={() => setShowScheduleModal(false)}
                                className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => handleFinalAction('TECHNICAL ROUND')}
                                className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReview;