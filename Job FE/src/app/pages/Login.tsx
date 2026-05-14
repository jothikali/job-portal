import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // 1. useSearchParams சேர்த்துள்ளேன்
import { Briefcase, Mail, Lock, ArrowRight, Chrome, Github, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 2. URL-ல் இருக்கும் ?redirect=/post-job போன்ற தகவல்களைப் படிக்க
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect');

    // --- Login Function ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Loading Start

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), // Inga state names correct-ah irukanum
            });

            const data = await response.json();

            // handleLogin function kulla indha if block-ah use pannunga:

            if (response.ok) {
                console.log("Login Success:", data);

                // LocalStorage-la user data save panrom
                localStorage.setItem('user', JSON.stringify(data.user));

                alert("Login Successful! 🚀");

                // ✅ FIX: 'response.data' kku badhula 'data' nu mattum podunga
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/home');
                }
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Server connect aagala bro!");
        } finally {
            setLoading(false); // <--- IDHU KANDIPPA IRUKANUM! Spinner ippo dhaan stop aagum.
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] items-center justify-center p-12 relative overflow-hidden">
                <div className="max-w-md z-10 text-white">
                    <Briefcase size={40} className="mb-6 text-blue-500" />
                    <h1 className="text-5xl font-black leading-tight mb-6 tracking-tighter">Find the job that fits your life.</h1>
                    <p className="text-slate-400 text-lg font-medium">Join thousands of companies and millions of job seekers today.</p>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            {redirectTo === '/post-job'
                                ? "Please login to post your job details."
                                : "Welcome back! Please enter your details."}
                        </p>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                            <Chrome className="size-5 text-red-500" /> Google
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                            <Github className="size-5" /> GitHub
                        </button>
                    </div>

                    <div className="relative mb-8 text-center border-t border-slate-100">
                        <span className="relative -top-3 bg-white px-4 text-xs font-black text-slate-400 uppercase">Or email</span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-black text-slate-700 uppercase">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    required
                                    type="email"
                                    autoComplete="new-password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 transition-all font-bold"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[13px] font-black text-slate-700 uppercase">Password</label>
                                <Link to="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 transition-all font-bold"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F172A]  text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin size-5" /> : <>Sign In <ArrowRight className="size-5" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        New here? <Link to="/signup" className="text-blue-600 font-black hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}