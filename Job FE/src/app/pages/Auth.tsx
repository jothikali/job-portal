import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, Loader2, ArrowRight, Chrome, Github } from 'lucide-react';
import { API } from '../lib/api';
import { toast } from '../lib/toast';

// ─── Reusable input ───────────────────────────────────────────────────────────
function Input({
    icon, name, type = 'text', placeholder, value, onChange, required = true,
}: {
    icon: React.ReactNode; name: string; type?: string;
    placeholder: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) {
    return (
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {icon}
            </span>
            <input
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete="off"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-3 pl-10 pr-4
                           text-sm font-semibold text-slate-800 placeholder:text-slate-400
                           outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
        </div>
    );
}

// ─── Social buttons ───────────────────────────────────────────────────────────
function SocialRow() {
    return (
        <div className="flex gap-3 justify-center mb-4">
            <button type="button"
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl
                           text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Chrome size={15} className="text-red-500" /> Google
            </button>
            <button type="button"
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl
                           text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Github size={15} /> GitHub
            </button>
        </div>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
    return (
        <div className="relative my-4 text-center border-t border-slate-100">
            <span className="relative -top-2.5 bg-white px-3 text-[10px] font-black text-slate-400 uppercase">
                or use email
            </span>
        </div>
    );
}

// ─── Main Auth component ──────────────────────────────────────────────────────
export function Auth() {
    const navigate        = useNavigate();
    const [searchParams]  = useSearchParams();
    const redirectTo      = searchParams.get('redirect');

    // Toggle state — false = Sign In panel active, true = Sign Up panel active
    const [isSignUp, setIsSignUp] = useState(false);

    // ── Login state ──
    const [loginEmail,    setLoginEmail]    = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading,  setLoginLoading]  = useState(false);

    // ── Signup state ──
    const [signupData, setSignupData] = useState({
        username: '', email: '', password: '', confirmPassword: '',
    });
    const [signupLoading, setSignupLoading] = useState(false);

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSignupData({ ...signupData, [e.target.name]: e.target.value });

    // ── Login handler (exact same logic as before) ──
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        try {
            const response = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Login successful! 🚀');
                navigate(data.user.role === 'admin' ? '/admin' : '/home');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch {
            toast.error('Cannot connect to server. Start your backend.');
        } finally {
            setLoginLoading(false);
        }
    };

    // ── Signup handler (exact same logic as before) ──
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        setSignupLoading(true);
        try {
            const response = await fetch(`${API}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: signupData.username,
                    email:    signupData.email,
                    password: signupData.password,
                }),
            });
            if (response.ok) {
                toast.success('Account created! Please sign in. 🔥');
                setIsSignUp(false); // slide back to sign-in
            } else {
                const data = await response.json();
                toast.error(data.message || 'Signup failed');
            }
        } catch {
            toast.error('Cannot connect to server. Start your backend.');
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100
                        flex items-center justify-center p-4 font-sans overflow-x-hidden">

            {/* ── Outer card ──────────────────────────────────────────────── */}
            <div className="relative w-full max-w-[900px] min-h-[560px] bg-white rounded-[32px]
                            shadow-2xl shadow-blue-200/40 overflow-hidden flex">

                {/* ══════════════════════════════════════════════════════════
                    SIGN-IN FORM  — always left half, visible when !isSignUp
                ══════════════════════════════════════════════════════════ */}
                <div className={`absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col
                                 items-center justify-center px-8 md:px-12 py-10 transition-all
                                 duration-700 ease-in-out
                                 ${isSignUp
                                    ? 'opacity-0 pointer-events-none translate-x-0 md:-translate-x-full'
                                    : 'opacity-100 translate-x-0'
                                 }`}>

                    {/* Logo */}
                    {/* Logo — Sign In side */}
                    <div className="flex items-center gap-2.5 mb-6">
                        <img src="/icons/job-logo.jpeg" alt="Job Nest" className="h-8 w-8 object-contain rounded-xl shadow-sm" />
                        <span className="font-black text-lg text-slate-900 tracking-tight">Job Nest</span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-1">Sign In</h2>
                    <p className="text-xs text-slate-500 font-medium mb-5 text-center">
                        {redirectTo === '/post-job'
                            ? 'Login to post your job listing.'
                            : 'Welcome back! Enter your details.'}
                    </p>

                    <SocialRow />
                    <Divider />

                    <form onSubmit={handleLogin} className="w-full space-y-3">
                        <Input icon={<Mail size={15} />} name="email" type="email"
                            placeholder="name@company.com"
                            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                        <Input icon={<Lock size={15} />} name="password" type="password"
                            placeholder="••••••••"
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

                        <div className="text-right">
                            <button type="button"
                                className="text-xs font-bold text-blue-600 hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" disabled={loginLoading}
                            className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-black
                                       text-sm flex items-center justify-center gap-2 shadow-lg
                                       hover:bg-slate-800 transition-all active:scale-[0.98]
                                       disabled:opacity-50 mt-1">
                            {loginLoading
                                ? <Loader2 className="animate-spin size-4" />
                                : <>Sign In <ArrowRight size={15} /></>}
                        </button>
                    </form>

                    {/* Mobile toggle (shown instead of overlay on small screens) */}
                    <p className="mt-5 text-xs text-slate-500 font-medium md:hidden">
                        No account?{' '}
                        <button onClick={() => setIsSignUp(true)}
                            className="text-blue-600 font-black hover:underline">
                            Create one
                        </button>
                    </p>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SIGN-UP FORM  — always right half, visible when isSignUp
                ══════════════════════════════════════════════════════════ */}
                <div className={`absolute inset-y-0 right-0 w-full md:w-1/2 flex flex-col
                                 items-center justify-center px-8 md:px-12 py-10 transition-all
                                 duration-700 ease-in-out
                                 ${isSignUp
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 pointer-events-none translate-x-0 md:translate-x-full'
                                 }`}>

                    {/* Logo */}
                    {/* Logo — Sign Up side */}
                    <div className="flex items-center gap-2.5 mb-6">
                        <img src="/icons/job-logo.jpeg" alt="Job Nest" className="h-8 w-8 object-contain rounded-xl shadow-sm" />
                        <span className="font-black text-lg text-slate-900 tracking-tight">Job Nest</span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-1">Create Account</h2>
                    <p className="text-xs text-slate-500 font-medium mb-5">Start your career journey today.</p>

                    <SocialRow />
                    <Divider />

                    <form onSubmit={handleSignup} className="w-full space-y-2.5">
                        <Input icon={<User size={15} />} name="username" type="text"
                            placeholder="Your full name"
                            value={signupData.username} onChange={handleSignupChange} />
                        <Input icon={<Mail size={15} />} name="email" type="email"
                            placeholder="name@email.com"
                            value={signupData.email} onChange={handleSignupChange} />
                        <Input icon={<Lock size={15} />} name="password" type="password"
                            placeholder="Password"
                            value={signupData.password} onChange={handleSignupChange} />
                        <Input icon={<ShieldCheck size={15} />} name="confirmPassword" type="password"
                            placeholder="Confirm password"
                            value={signupData.confirmPassword} onChange={handleSignupChange} />

                        <button type="submit" disabled={signupLoading}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black
                                       text-sm flex items-center justify-center gap-2 shadow-lg
                                       hover:bg-blue-700 transition-all active:scale-[0.98]
                                       disabled:opacity-50 mt-1">
                            {signupLoading
                                ? <Loader2 className="animate-spin size-4" />
                                : <>Register <ArrowRight size={15} /></>}
                        </button>
                    </form>

                    {/* Mobile toggle */}
                    <p className="mt-5 text-xs text-slate-500 font-medium md:hidden">
                        Already have an account?{' '}
                        <button onClick={() => setIsSignUp(false)}
                            className="text-blue-600 font-black hover:underline">
                            Sign In
                        </button>
                    </p>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SLIDING OVERLAY — desktop only (md+)
                    Covers right half when showing Sign In,
                    slides left to cover left half when showing Sign Up.
                ══════════════════════════════════════════════════════════ */}
                <div className={`hidden md:flex absolute inset-y-0 w-1/2 z-10 transition-all
                                 duration-700 ease-in-out
                                 ${isSignUp ? 'left-0' : 'left-1/2'}`}>

                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-blue-900 to-indigo-800">
                        {/* Decorative blobs */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
                    </div>

                    {/* Overlay content */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full px-10 text-center">

                        {/* Logo on overlay */}
                        <div className="mb-6">
                            <img src="/icons/job-logo.jpeg" alt="Job Nest"
                                 className="h-14 w-14 object-contain rounded-[20px] shadow-2xl mx-auto" />
                        </div>

                        {/* CTA copy — swaps based on which side is active */}
                        <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                            {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
                        </h3>
                        <p className="text-blue-200 text-sm font-medium mb-8 leading-relaxed max-w-[220px]">
                            {isSignUp
                                ? 'Already have an account? Sign in and continue your journey.'
                                : 'Register with your personal details to start your career journey.'}
                        </p>

                        {/* Toggle button */}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="px-8 py-3 border-2 border-white text-white font-black text-xs
                                       uppercase tracking-[0.2em] rounded-full hover:bg-white
                                       hover:text-[#0F172A] transition-all duration-300 active:scale-95">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>

            </div>{/* end outer card */}
        </div>
    );
}

export default Auth;
