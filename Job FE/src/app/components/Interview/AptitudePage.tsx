import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Timer, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Send, XCircle } from 'lucide-react';

const AptitudePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [timeLeft, setTimeLeft] = useState(900);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success Modal State

    const isSubmittedRef = React.useRef(false);
    const answersRef = React.useRef(answers);
    const questionsRef = React.useRef(questions);

    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { questionsRef.current = questions; }, [questions]);

    const handleSubmit = useCallback(async () => {
        if (isSubmittedRef.current) return;
        isSubmittedRef.current = true;
        setIsSubmitted(true);

        let calculatedScore = 0;
        questionsRef.current.forEach((q) => {
            const userAns = answersRef.current[q.id];
            const correctAns = q.correct_option;
            if (userAns && String(userAns).trim().toUpperCase() === String(correctAns).trim().toUpperCase()) {
                calculatedScore += 1;
            }
        });

        try {
            // ROMBA MUKKIYAM: status: 'FINISHED' nu extra data anuprom
            await axios.post('http://localhost:5000/api/aptitude/submit-test', {
                applicationId: id,
                answers: answersRef.current,
                score: calculatedScore,
                status: 'FINISHED' // <--- IDHU DHAAN CARD-AI LOCK PANNUM
            });

            setShowSuccessModal(true);
        } catch (err) {
            console.error("Submission error:", err);
            isSubmittedRef.current = false;
            setIsSubmitted(false);
            alert("Submission failed. Please try again.");
        }
    }, [id]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/aptitude/questions')
            .then(res => {
                if (res.data.length === 0) navigate('/my-jobs');
                setQuestions(res.data);
            })
            .catch(err => console.error("Fetch error:", err));

        const handleVisibility = () => {
            if (document.hidden && !isSubmittedRef.current) handleSubmit();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [navigate, handleSubmit]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isSubmittedRef.current) handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [handleSubmit]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionSelect = (option: string) => {
        setAnswers({ ...answers, [questions[currentIdx].id]: option });
    };

    if (questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center font-black text-slate-400 bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mb-4"></div>
                INITIALIZING ASSESSMENT...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col h-screen overflow-hidden font-sans relative">

            {/* SUCCESS MODAL POPUP */}
            {showSuccessModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Test Completed!</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Your assessment has been securely submitted. Our recruitment team will review your performance and notify you of the results soon.
                        </p>
                        <button
                            onClick={() => navigate('/my-jobs')}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Back to My Jobs
                        </button>
                    </div>
                </div>
            )}

            {/* TOP BAR */}
            <header className="h-16 bg-white border-b px-8 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-black uppercase">Technical Assessment</div>
                    <h1 className="font-bold text-slate-700 hidden md:block">Frontend Developer Role</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                        <Timer size={18} className="text-rose-500" />
                        <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={() => window.confirm("Finish the test?") && handleSubmit()}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2"
                    >
                        Finish Test <Send size={14} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT: QUESTION CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Question {currentIdx + 1}</span>
                                <span className="text-xs font-bold text-indigo-600">Marks: 1.0</span>
                            </div>

                            <div className="p-8">
                                <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                                    {questions[currentIdx].question}
                                </h2>

                                <div className="space-y-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleOptionSelect(opt)}
                                            className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center group ${answers[questions[currentIdx].id] === opt
                                                ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                                : 'border-slate-100 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-4 font-black text-sm transition-colors ${answers[questions[currentIdx].id] === opt
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-slate-200 text-slate-400 group-hover:border-slate-400'
                                                }`}>
                                                {opt}
                                            </div>
                                            <span className={`font-bold ${answers[questions[currentIdx].id] === opt ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                {questions[currentIdx][`option_${opt.toLowerCase()}`]}
                                            </span>
                                            {answers[questions[currentIdx].id] === opt && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t flex justify-between">
                                <button
                                    disabled={currentIdx === 0}
                                    onClick={() => setCurrentIdx(prev => prev - 1)}
                                    className="flex items-center gap-2 font-black text-xs uppercase text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>

                                <button
                                    onClick={() => currentIdx === questions.length - 1 ? handleSubmit() : setCurrentIdx(prev => prev + 1)}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                                >
                                    {currentIdx === questions.length - 1 ? "Submit Assessment" : "Save & Next"} <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                            <AlertTriangle size={14} className="text-amber-500" /> Proctoring active: Tab switching & refreshing will void the test.
                        </div>
                    </div>
                </main>

                {/* RIGHT: NAVIGATION PALETTE */}
                <aside className="w-64 bg-white border-l flex flex-col hidden lg:flex flex-shrink-0 shadow-sm">
                    <div className="p-5 border-b">
                        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Question Palette</h3>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => {
                                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIdx(i)}
                                        className={`w-10 h-10 rounded-lg font-black text-xs flex items-center justify-center transition-all ${currentIdx === i ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110 z-10' : ''
                                            } ${isAnswered
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 border-t space-y-3">
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Answered
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500">
                            <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div> Not Answered
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AptitudePage;