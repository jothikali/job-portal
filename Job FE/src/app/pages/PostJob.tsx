import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, MapPin, DollarSign, Send, X,
    Building2, Layers, ListChecks, Star, CheckCircle2,
    ArrowRight, ArrowLeft, Info, Cpu
} from "lucide-react";
import { toast } from "../lib/toast";

export function PostJob() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [allSkills, setAllSkills] = useState<string[]>([]);
    const [skillSearch, setSkillSearch] = useState("");
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "", company: "", location: "", salary: "",
        description: "", type: "Full-time", category: "",
        requirements: "", features: ""
    });

    const isStep1Valid = formData.title && formData.company && formData.category;
    const isStep2Valid = formData.location && formData.salary;

    // Fetch skills from backend for suggestions
    useEffect(() => {
        fetch("http://localhost:5000/api/skills")
            .then(r => r.json())
            .then(data => setAllSkills(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, []);

    const filteredSkillSuggestions = allSkills.filter(s =>
        s.toLowerCase().includes(skillSearch.toLowerCase()) &&
        !requiredSkills.includes(s)
    ).slice(0, 8);

    const addSkill = (skill: string) => {
        if (skill && !requiredSkills.includes(skill)) {
            setRequiredSkills([...requiredSkills, skill]);
        }
        setSkillSearch("");
    };

    const removeSkill = (idx: number) => {
        setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    required_skills: requiredSkills.join(","),
                }),
            });
            if (response.ok) {
                toast.success("Job posted successfully!");
                navigate("/admin");
            } else {
                toast.error("Failed to post job. Please try again.");
            }
        } catch {
            toast.error("Server error. Make sure your backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 max-w-6xl mx-auto">

            {/* --- LEFT: STEP INDICATOR --- */}
            <div className="w-full xl:w-56 space-y-2">
                {[
                    { id: 1, label: "Basics", sub: "Core information" },
                    { id: 2, label: "Details", sub: "Logistics & Type" },
                    { id: 3, label: "Content", sub: "Deep dive & Skills" }
                ].map((s) => (
                    <div key={s.id} className={`p-4 rounded-2xl border-2 transition-all duration-300 ${step === s.id ? 'bg-white border-blue-600 shadow-md shadow-blue-50' : 'bg-transparent border-transparent opacity-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`size-7 rounded-xl flex items-center justify-center font-black text-xs transition-all ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-blue-600' : 'text-slate-500'}`}>{s.label}</p>
                                <p className="text-[10px] font-medium text-slate-400">{s.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mt-4">
                    <Info size={14} className="text-blue-600 mb-1.5" />
                    <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
                        Pro Tip: Descriptive job titles get 40% more applications. Be specific!
                    </p>
                </div>
            </div>

            {/* --- RIGHT: FORM SECTION --- */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 size-48 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-800 mb-1">
                            {step === 1 && "Start with the basics"}
                            {step === 2 && "Where and How?"}
                            {step === 3 && "Tell them more"}
                        </h2>
                        <div className="h-0.5 w-8 bg-blue-600 rounded-full mb-6" />

                        {/* STEP 1: BASICS */}
                        {step === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Job Role Name</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={15} />
                                            <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                                                placeholder="Software Engineer" value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Hiring Company</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={15} />
                                            <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                                                placeholder="TechCorp Solutions" value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Industrial Category</label>
                                    <div className="relative group">
                                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={15} />
                                        <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                                            placeholder="Information Technology" value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DETAILS */}
                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Office Location</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={15} />
                                            <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                                                placeholder="Bangalore (Hybrid)" value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Offered Package</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={15} />
                                            <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                                                placeholder="₹12,00,000 - ₹18,00,000" value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Employment Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Full-time", "Part-time", "Remote", "Internship"].map((type) => (
                                            <button key={type} type="button"
                                                onClick={() => setFormData({ ...formData, type })}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${formData.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONTENT + REQUIRED SKILLS */}
                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Job Summary</label>
                                    <textarea required rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm resize-none"
                                        placeholder="Briefly describe the role and goals..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                {/* Required Skills Tag Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                        <Cpu size={12} className="text-blue-600" /> Required Skills
                                    </label>
                                    {/* Tags */}
                                    {requiredSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {requiredSkills.map((skill, idx) => (
                                                <span key={idx} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase animate-in zoom-in">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(idx)}>
                                                        <X size={10} className="hover:text-red-200" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Search input */}
                                    <div className="relative">
                                        <div className="flex items-center gap-2 bg-slate-50 border-2 border-transparent rounded-2xl px-3 py-2.5 focus-within:bg-white focus-within:border-blue-600 transition-all">
                                            <Cpu size={14} className="text-slate-400 shrink-0" />
                                            <input
                                                value={skillSearch}
                                                onChange={(e) => setSkillSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') { e.preventDefault(); if (skillSearch.trim()) addSkill(skillSearch.trim()); }
                                                }}
                                                className="bg-transparent outline-none w-full font-bold text-slate-700 text-xs placeholder:text-slate-300"
                                                placeholder="Type a skill and press Enter (e.g. React)..."
                                                autoComplete="off"
                                            />
                                        </div>
                                        {skillSearch && filteredSkillSuggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden">
                                                {filteredSkillSuggestions.map((skill) => (
                                                    <button key={skill} type="button"
                                                        onClick={() => addSkill(skill)}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-xs font-bold text-slate-700 transition-colors flex justify-between group">
                                                        {skill}
                                                        <span className="text-blue-500 opacity-0 group-hover:opacity-100 text-[10px] font-black">ADD</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                            <ListChecks size={12} className="text-blue-600" /> Requirements
                                        </label>
                                        <textarea rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-600 text-xs resize-none"
                                            placeholder="List core requirements..."
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                            <Star size={12} className="text-blue-600" /> Company Benefits
                                        </label>
                                        <textarea rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-600 text-xs resize-none"
                                            placeholder="Perks, Insurance, etc..."
                                            value={formData.features}
                                            onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER: NAVIGATION */}
                    <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-50">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                                <ArrowLeft size={15} /> Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button type="button"
                                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                onClick={() => setStep(step + 1)}
                                className="flex-1 bg-slate-900 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-30 disabled:cursor-not-allowed group">
                                Save & Continue <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button type="submit" disabled={loading}
                                className="flex-1 bg-blue-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50">
                                {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Publish Job Listing</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostJob;
