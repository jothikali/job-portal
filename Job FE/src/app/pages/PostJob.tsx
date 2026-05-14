import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, MapPin, DollarSign, Send,
    Building2, Layers, ListChecks, Star, CheckCircle2, ArrowRight, ArrowLeft, Info
} from "lucide-react";

export function PostJob() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: "", company: "", location: "", salary: "",
        description: "", type: "Full-time", category: "",
        requirements: "", features: ""
    });

    // UX: Current Step-la ellam fill aayiduchanu check panna
    const isStep1Valid = formData.title && formData.company && formData.category;
    const isStep2Valid = formData.location && formData.salary;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // ... unga fetching logic inge irukkum ...
        try {
            const response = await fetch("http://localhost:5000/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Job Posted Successfully! ✅");
                navigate("/admin");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-10 max-w-7xl mx-auto p-2">
            
            {/* --- LEFT: STEP INDICATOR (More Polish) --- */}
            <div className="w-full xl:w-72 space-y-4">
                {[
                    { id: 1, label: "Basics", sub: "Core information" },
                    { id: 2, label: "Details", sub: "Logistics & Type" },
                    { id: 3, label: "Content", sub: "Deep dive & Skills" }
                ].map((s) => (
                    <div key={s.id} className={`p-5 rounded-3xl border-2 transition-all duration-300 ${step === s.id ? 'bg-white border-blue-600 shadow-2xl shadow-blue-100 -translate-y-1' : 'bg-transparent border-transparent opacity-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > s.id ? <CheckCircle2 size={20} /> : s.id}
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${step === s.id ? 'text-blue-600' : 'text-slate-500'}`}>{s.label}</p>
                                <p className="text-[11px] font-bold text-slate-400">{s.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Visual Hint */}
                <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100/50 mt-10">
                    <Info size={20} className="text-blue-600 mb-2" />
                    <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                        Pro Tip: Descriptive job titles get 40% more applications. Be specific!
                    </p>
                </div>
            </div>

            {/* --- RIGHT: FORM SECTION (Glassmorphism Touch) --- */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[48px] p-12 shadow-sm relative overflow-hidden min-h-[500px]">
                {/* Decor elements */}
                <div className="absolute top-0 right-0 size-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <form onSubmit={handleSubmit} className="relative z-10 h-full flex flex-col justify-between">
                    
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">
                            {step === 1 && "Start with the basics"}
                            {step === 2 && "Where and How?"}
                            {step === 3 && "Tell them more"}
                        </h2>
                        <div className="h-1 w-12 bg-blue-600 rounded-full mb-10"></div>

                        {/* STEP 1: BASICS */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Job Role Name</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                                                placeholder="Software Engineer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Hiring Company</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                                                placeholder="TechCorp Solutions" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Industrial Category</label>
                                    <div className="relative group">
                                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                        <input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                                            placeholder="Information Technology" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DETAILS */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Office Location</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                                                placeholder="Bangalore (Hybrid)" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Offered Package</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                            <input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                                                placeholder="₹12,00,000 - ₹18,00,000" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Employment Type</label>
                                    <div className="flex flex-wrap gap-4">
                                        {["Full-time", "Part-time", "Remote", "Internship"].map((type) => (
                                            <button key={type} type="button" 
                                                onClick={() => setFormData({ ...formData, type: type })}
                                                className={`px-8 py-4 rounded-2xl text-[13px] font-black border-2 transition-all ${formData.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100'}`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONTENT */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Job Summary</label>
                                    <textarea required rows={5} className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 resize-none"
                                        placeholder="Briefly describe the role and goals..." value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                            <ListChecks size={14} className="text-blue-600" /> Requirements
                                        </label>
                                        <textarea className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-600 resize-none text-[13px]"
                                            placeholder="List core skills..." value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                            <Star size={14} className="text-blue-600" /> Company Benefits
                                        </label>
                                        <textarea className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-600 resize-none text-[13px]"
                                            placeholder="Perks, Insurance, etc..." value={formData.features}
                                            onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER: NAVIGATION */}
                    <div className="mt-12 flex items-center gap-6 pt-10 border-t border-slate-50">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-3 px-10 py-5 rounded-[24px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                                <ArrowLeft size={20} /> Back
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button type="button" 
                                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                onClick={() => setStep(step + 1)} 
                                className="flex-1 bg-slate-900 text-white flex items-center justify-center gap-3 py-5 rounded-[24px] font-black hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-30 disabled:cursor-not-allowed group">
                                Save & Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white flex items-center justify-center gap-3 py-5 rounded-[24px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50">
                                {loading ? (
                                    <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <><Send size={20} /> Publish Job Listing</>
                                )}
                            </button>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}
export default PostJob;