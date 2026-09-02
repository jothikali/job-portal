import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Timer, CheckCircle, ChevronLeft, ChevronRight,
    Send, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

// ─── Toast component ──────────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'warn' | 'error'; }
function Toast({ message, type }: ToastProps) {
    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-black text-sm uppercase tracking-wide animate-in slide-in-from-top-4 duration-300 ${
            type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
        }`}>
            {type === 'warn' ? <Eye size={18} /> : <EyeOff size={18} />}
            {message}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const EXAM_DURATION = 10 * 60; // 10 minutes in seconds
const MAX_TAB_VIOLATIONS = 2;

const AptitudePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions]         = useState<any[]>([]);
    const [currentIdx, setCurrentIdx]       = useState(0);
    const [answers, setAnswers]             = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft]           = useState(EXAM_DURATION);
    const [isSubmitted, setIsSubmitted]     = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [toast, setToast]                 = useState<ToastProps | null>(null);
    const [tabViolations, setTabViolations] = useState(0);
    const [finalScore, setFinalScore]       = useState<number | null>(null);

    // Refs to avoid stale closures in callbacks
    const isSubmittedRef   = useRef(false);
    const answersRef       = useRef(answers);
    const questionsRef     = useRef(questions);
    const violationsRef    = useRef(0);

    useEffect(() => { answersRef.current = answers; },   [answers]);
    useEffect(() => { questionsRef.current = questions; }, [questions]);

    // ─── Toast helper ─────────────────────────────────────────────────────────
    const showToast = useCallback((message: string, type: 'warn' | 'error', duration = 3500) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }, []);

    // ─── Score calculator ─────────────────────────────────────────────────────
    const calculateScore = useCallback(() => {
        let score = 0;
        questionsRef.current.forEach((q) => {
            const userAns = answersRef.current[q.id];
            if (userAns && String(userAns).trim().toUpperCase() === String(q.correct_option).trim().toUpperCase()) {
                score += 1;
            }
        });
        return score;
    }, []);

    // ─── Submit handler ───────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (reason: 'manual' | 'timeout' | 'proctoring' = 'manual') => {
        if (isSubmittedRef.current) return;
        isSubmittedRef.current = true;
        setIsSubmitted(true);

        const score = calculateScore();
        setFinalScore(score);

        try {
            await axios.post('http://localhost:5000/api/aptitude/submit-test', {
                applicationId: id,
                answers: answersRef.current,
                score,
                submitReason: reason,
            });
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Submission error:", err);
            isSubmittedRef.current = false;
            setIsSubmitted(false);
            showToast('Submission failed. Please try again.', 'error');
        }
    }, [id, calculateScore, showToast]);

    // ─── Tab-switch / visibility guard ───────────────────────────────────────
    useEffect(() => {
        const handleVisibility = () => {
            if (!document.hidden || isSubmittedRef.current) return;

            violationsRef.current += 1;
            setTabViolations(violationsRef.current);

            if (violationsRef.current < MAX_TAB_VIOLATIONS) {
                showToast(
                    `⚠️ Warning ${violationsRef.current}/${MAX_TAB_VIOLATIONS - 1}: Tab switching detected! Next violation will auto-submit.`,
                    'warn',
                    5000
                );
            } else {
                showToast('🚨 Proctoring violation! Test auto-submitted.', 'error', 4000);
                setTimeout(() => handleSubmit('proctoring'), 1500);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [handleSubmit, showToast]);

    // ─── Fetch questions ──────────────────────────────────────────────────────
    useEffect(() => {
        axios.get('http://localhost:5000/api/aptitude/questions')
            .then(res => {
                if (res.data.length === 0) navigate('/my-jobs');
                setQuestions(res.data);
            })
            .catch(err => console.error("Fetch error:", err));
    }, [navigate]);

    // ─── Countdown timer ──────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isSubmittedRef.current) {
                        showToast('⏰ Time up! Submitting your test...', 'error', 4000);
                        setTimeout(() => handleSubmit('timeout'), 1500);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [handleSubmit, showToast]);

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: option }));
    };

    const answeredCount = Object.keys(answers).length;

    // ─── Loading state ────────────────────────────────────────────────────────
    if (questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center font-black text-slate-400 bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mb-4" />
                INITIALIZING ASSESSMENT...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col h-screen overflow-hidden font-sans relative">

            {/* ─── Toast notification ───────────────────────────────────────── */}
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* ─── Success modal ────────────────────────────────────────────── */}
            {showSuccessModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Test Completed!</h2>
                        {finalScore !== null && (
                            <p className="text-4xl font-black text-indigo-600 mb-2">
                                {finalScore} <span className="text-lg text-slate-400">/ {questions.length}</span>
                            </p>
                        )}
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">
                            Your assessment has been securely submitted. Our team will review your performance shortly.
                        </p>
                        <button
                            onClick={() => navigate('/my-jobs')}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            Back to My Jobs
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Top bar ──────────────────────────────────────────────────── */}
            <header className="h-16 bg-white border-b px-8 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-black uppercase">
                        Technical Assessment
                    </div>
                    <h1 className="font-bold text-slate-700 hidden md:block">Frontend Developer Role</h1>
                    {/* Violation indicator */}
                    {tabViolations > 0 && (
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            <AlertTriangle size={12} /> {tabViolations}/{MAX_TAB_VIOLATIONS - 1} violation{tabViolations > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {/* Countdown timer */}
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border ${
                        timeLeft < 60
                            ? 'bg-red-50 border-red-200 animate-pulse'
                            : timeLeft < 180
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-rose-50 border-rose-100'
                    }`}>
                        <Timer size={18} className={timeLeft < 60 ? 'text-red-500' : 'text-rose-500'} />
                        <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <button
                        onClick={() => window.confirm('Are you sure you want to finish the test?') && handleSubmit('manual')}
                        disabled={isSubmitted}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        Finish Test <Send size={14} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ─── Question area ────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Question {currentIdx + 1} of {questions.length}
                                </span>
                                <span className="text-xs font-bold text-indigo-600">Marks: 1.0</span>
                            </div>

                            <div className="p-8">
                                <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                                    {questions[currentIdx].question}
                                </h2>

                                <div className="space-y-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => {
                                        const isSelected = answers[questions[currentIdx].id] === opt;
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleOptionSelect(opt)}
                                                disabled={isSubmitted}
                                                className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center group ${
                                                    isSelected
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                                        : 'border-slate-100 hover:border-slate-300 bg-white'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-4 font-black text-sm transition-colors shrink-0 ${
                                                    isSelected
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'border-slate-200 text-slate-400 group-hover:border-slate-400'
                                                }`}>
                                                    {opt}
                                                </div>
                                                <span className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                    {questions[currentIdx][`option_${opt.toLowerCase()}`]}
                                                </span>
                                                {isSelected && <CheckCircle className="ml-auto text-indigo-600 shrink-0" size={20} />}
                                            </button>
                                        );
                                    })}
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
                                    onClick={() => currentIdx === questions.length - 1
                                        ? handleSubmit('manual')
                                        : setCurrentIdx(prev => prev + 1)
                                    }
                                    disabled={isSubmitted}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {currentIdx === questions.length - 1 ? 'Submit Assessment' : 'Save & Next'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Proctoring notice */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                            <AlertTriangle size={14} className="text-amber-500" />
                            Proctoring active — 1 warning given, 2nd tab switch auto-submits the test.
                        </div>
                    </div>
                </main>

                {/* ─── Right: Question palette ──────────────────────────────── */}
                <aside className="w-64 bg-white border-l hidden lg:flex flex-col shrink-0 shadow-sm">
                    <div className="p-5 border-b">
                        <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">
                            Question Palette
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                            {answeredCount} / {questions.length} answered
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="px-5 pt-4">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all"
                                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, i) => {
                                const isAnswered = answers[q.id] !== undefined;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIdx(i)}
                                        className={`w-10 h-10 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                                            currentIdx === i ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110 z-10' : ''
                                        } ${
                                            isAnswered
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
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Answered
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500">
                            <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm" /> Not Answered
                        </div>
                        {/* Time left in sidebar too */}
                        <div className={`mt-2 text-center py-2 rounded-xl font-mono font-black text-sm ${
                            timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AptitudePage;
