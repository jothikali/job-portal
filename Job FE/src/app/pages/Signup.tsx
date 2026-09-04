import { API } from '../lib/api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Chrome, Github, ShieldCheck, User } from 'lucide-react';
import { toast } from '../lib/toast';

export function Signup() {
    // 1. State Object
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })});

            if (response.ok) {
                toast.success("Account created successfully! 🔥");
                navigate('/login');
            } else {
                const data = await response.json();
                toast.error(data.message || "Signup failed");
            }
        } catch (err) {
            toast.error("Cannot connect to server. Start your backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-x-hidden font-sans">
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] items-center justify-center p-12 relative overflow-hidden">
                <div className="max-w-md z-10 text-white">
                    <img src="/icons/job-logo.jpeg" alt="Job Nest"
                         className="h-14 w-14 object-contain rounded-2xl shadow-2xl shadow-blue-500/30 mb-8" />
                    <h1 className="text-5xl font-black leading-tight mb-6 tracking-tighter">
                        Start your <br/> professional <span className="text-blue-500">Journey.</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">Join us to find your dream career today.</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 min-h-screen">
                <div className="w-full max-w-[440px] bg-white rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-200/60 p-6 sm:p-8 md:p-10 border border-slate-100">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-6 lg:hidden">
                        <img src="/icons/job-logo.jpeg" alt="Job Nest"
                             className="h-8 w-8 object-contain rounded-xl shadow-sm" />
                        <span className="font-black text-lg text-slate-900 tracking-tight">Job Nest</span>
                    </div>

                    <div className="mb-6 text-left">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Sign Up</h2>
                        <p className="text-slate-500 font-medium mt-1 text-sm">Create your account.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-3 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm">
                            <Chrome className="size-4 text-red-500" /> Google
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-3 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm">
                            <Github className="size-4" /> GitHub
                        </button>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input name="username" required type="text"
                                    value={formData.username} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-600 font-bold text-sm"
                                    placeholder="Your name" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input name="email" required type="email"
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-600 font-bold text-sm"
                                    placeholder="name@email.com" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input name="password" required type="password"
                                    value={formData.password} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-600 font-bold text-sm"
                                    placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Confirm Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input name="confirmPassword" required type="password"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-600 font-bold text-sm"
                                    placeholder="••••••••" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin size-5" /> : <>Register <ArrowRight className="size-5" /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-slate-500 font-medium text-sm">
                        Already have an account? <Link to="/login" className="text-blue-600 font-black hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}