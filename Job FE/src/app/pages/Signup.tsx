import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, Loader2, Chrome, Github, ShieldCheck } from 'lucide-react';

export function Signup() {
    // 1. State Object
    const [formData, setFormData] = useState({
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
            alert("Passwords match aagala bro!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            if (response.ok) {
                alert("Account Created Success! 🔥");
                navigate('/login');
            } else {
                const data = await response.json();
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            alert("Server connect aagala bro! Start your backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-sans">
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] items-center justify-center p-12 relative overflow-hidden">
                <div className="max-w-md z-10 text-white">
                    <div className="bg-blue-600 w-fit p-3.5 rounded-2xl mb-8 shadow-xl shadow-blue-500/20">
                        <Briefcase size={32} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black leading-tight mb-6 tracking-tighter">
                        Start your <br/> professional <span className="text-blue-500">Journey.</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">Join us to find your dream career today.</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50/50">
                <div className="w-full max-w-[440px] bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100">
                    <div className="mb-8 text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign Up</h2>
                        <p className="text-slate-500 font-medium mt-1">Create your account.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm">
                            <Chrome className="size-4 text-red-500" /> Google
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm">
                            <Github className="size-4" /> GitHub
                        </button>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input 
                                    name="email" 
                                    required 
                                    type="email" 
                                    value={formData.email} // Fixed here
                                    onChange={handleChange} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-600 font-bold text-sm" 
                                    placeholder="name@email.com" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input 
                                    name="password" 
                                    required 
                                    type="password" 
                                    value={formData.password} // Fixed here
                                    onChange={handleChange} 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-600 font-bold text-sm" 
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-700 uppercase">Confirm Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input 
                                    name="confirmPassword" 
                                    required 
                                    type="password" 
                                    value={formData.confirmPassword} // Fixed here
                                    onChange={handleChange} 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-600 font-bold text-sm" 
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 mt-2 transition-all">
                            {loading ? <Loader2 className="animate-spin size-5" /> : <>Register <ArrowRight className="size-5" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Already have an account? <Link to="/login" className="text-blue-600 font-black hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}