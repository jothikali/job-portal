import { API } from '../lib/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Upload, CheckCircle2, ArrowRight, User, Mail, Phone, Globe, MapPin, BookOpen, Cpu, Briefcase, Banknote, Clock, Languages, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '../lib/toast';

// Interface defined outside the component
interface IJobForm {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    resume: File | null;

    degree: string;
    college: string;
    yearOfPassing: string;
    techSkills: string;
    experienceType: string;
    company: string;
    years: string;
    expectedSalary: string;
    availability: string;
    englishLevel: string;
    otherLanguages: string;
    aboutMe: string;
    whyHireMe: string;
}

export function JobApplication() {
    const navigate = useNavigate();
    const { jobId } = useParams();

    // 1. All States First
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allSkills, setAllSkills] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState<IJobForm>({
        fullName: '', email: '', phone: '',
        country: '', state: '', city: '',
        resume: null, degree: '', college: '', yearOfPassing: '',
        techSkills: '', experienceType: 'fresher', company: '', years: '',
        expectedSalary: '', availability: '',
        englishLevel: '', otherLanguages: '',
        aboutMe: '', whyHireMe: ''
    });

    // 2. Variables & Constants Second (Steps array top-la kondu vandhutten)
    const steps = [
        { s: 1, label: 'Personal', icon: <User size={18} /> },
        { s: 2, label: 'Education', icon: <BookOpen size={18} /> },
        { s: 3, label: 'Experience', icon: <Cpu size={18} /> },
        { s: 4, label: 'Salary', icon: <Banknote size={18} /> },
        { s: 5, label: 'Review', icon: <Info size={18} /> }
    ];

    // 3. Derived Logic (State-ku keezha irukanum)
    const currentSkills = formData.techSkills
        ? formData.techSkills.split(',').filter(s => s.trim() !== "")
        : [];

    const filteredSuggestions = allSkills.filter(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !currentSkills.includes(skill)
    ).slice(0, 8);

    // 4. UseEffects
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await fetch(`${API}/skills`);
                const data = await response.json();
                setAllSkills(data);
            } catch (err) {
                console.error("Failed to fetch skills:", err);
            }
        };
        fetchSkills();
    }, []);

    // 5. Functions
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClose = () => navigate('/home');
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('jobId', jobId ?? "");
            data.append('userId', '1');

            (Object.keys(formData) as Array<keyof IJobForm>).forEach((key) => {
                if (key !== 'resume') {
                    const backendKey = key === 'techSkills' ? 'skills' : key;
                    const value = formData[key];
                    data.append(backendKey, value ? value.toString() : "");
                }
            });

            if (formData.resume) {
                data.append('resume', formData.resume);
            }

            const response = await fetch(`${API}/jobs/apply`, {
                method: 'POST',
                body: data
            });

            if (response.ok) setStep(6);
            else {
                const errorData = await response.json();
                toast.error(`Application failed: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Network error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    // யூசர் டைப் பண்ணும்போது பில்டர் பண்ற லாஜிக்


    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
            {/* --- TOP HEADER --- */}
            <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-xl shadow-sm">
                        <Briefcase className="size-5 text-[#0F172A]" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-slate-800 tracking-tight uppercase">Apply for Position</h2>
                        <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest hidden sm:block">Dotok Communications</p>
                    </div>
                </div>
                {/* Progress Bar — compact on mobile */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    {steps.map((s, idx) => (
                        <div key={s.s} className="flex items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step >= s.s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > s.s ? <CheckCircle2 size={10} /> : s.s}
                            </div>
                            {idx !== steps.length - 1 && <div className={`w-4 md:w-8 h-[2px] mx-0.5 ${step > s.s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400">
                    <X size={22} />
                </button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* --- LEFT SIDEBAR (DARK UI) --- */}
                <aside className="hidden lg:flex w-[350px] bg-[#0F172A] p-10 flex-col justify-between shrink-0 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white leading-tight mb-4 italic uppercase">
                            Start Your <br /> <span className="text-blue-500">Dream Career</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">
                            Fill out the form to join our world-class team. Your journey starts here.
                        </p>
                    </div>
                    <nav className="relative z-10 space-y-8">
                        {steps.map((item) => (
                            <div key={item.s} className="flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${step >= item.s ? 'bg-black-600 border-blue-600 text-white shadow-xl shadow-blue-600/30' : 'border-slate-800 text-slate-600 group-hover:border-slate-700'}`}>
                                    {step > item.s ? <CheckCircle2 size={20} /> : item.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[8px] uppercase tracking-widest font-black ${step >= item.s ? 'text-blue-400' : 'text-slate-600'}`}>Step 0{item.s}</span>
                                    <span className={`text-sm font-bold tracking-tight ${step >= item.s ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                                </div>
                            </div>
                        ))}
                    </nav>
                    <div className="relative z-10 pt-10 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">© 2026 Dotok Communications</p>
                    </div>
                </aside>
                {/* --- MAIN FORM CONTENT --- */}
                <main className="flex-1 overflow-y-auto bg-white flex justify-center">
                    <div className="w-full max-w-3xl px-4 md:px-8 py-8 md:py-16">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"                           >                               {/* Form Steps Content (Step 1 to 6 - Unchanged logic) */}
                                {step === 1 && (
                                    <div className="space-y-10">
                                        <SectionTitle title="Personal Details" sub="How can we reach you?" />
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                            <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={<User size={18} />} />
                                            <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} icon={<Mail size={18} />} />
                                            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone size={18} />} />
                                            <Input label="Country" name="country" value={formData.country} onChange={handleChange} icon={<Globe size={18} />} />
                                            <Input label="State" name="state" value={formData.state} onChange={handleChange} icon={<MapPin size={18} />} />
                                            <Input label="City" name="city" value={formData.city} onChange={handleChange} icon={<MapPin size={18} />} />
                                        </div>
                                    </div>
                                )}
                                {/* Step 2: Education & Resume Upload */}
                                {step === 2 && (
                                    <div className="space-y-10">
                                        <SectionTitle title="Academic & Documents" sub="Prove your expertise" />
                                        {/* Resume Upload Area */}
                                        <div
                                            onClick={() => document.getElementById('resume-upload')?.click()}
                                            className="group relative border-2 border-dashed border-slate-200 rounded-[32px] p-10 bg-slate-50/50 hover:bg-white hover:border-blue-500 transition-all text-center cursor-pointer"                                        >
                                            {/* Step 2: Resume Upload Area-la indha change pannunga */}
                                            <input
                                                id="resume-upload"
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setFormData({ ...formData, resume: e.target.files[0] });
                                                    }
                                                }}
                                            />
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="text-blue-600" size={28} />
                                            </div>
                                            <h4 className="font-black text-slate-900">Click to Upload Resume</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PDF, DOCX up to 5MB</p>

                                            {formData.resume && (
                                                <div className="mt-4 p-2 bg-emerald-50 rounded-xl inline-flex items-center gap-2 border border-emerald-100">
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                    <span className="text-emerald-700 font-bold text-[10px] uppercase">{(formData.resume as any).name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                            <Input label="Highest Qualification" name="degree" value={formData.degree} onChange={handleChange} icon={<BookOpen size={18} />} />
                                            <Input label="College / University" name="college" value={formData.college} onChange={handleChange} icon={<Globe size={18} />} />
                                        </div>
                                    </div>
                                )}
                                {/* Step 3: Skills & Experience - "Tag Style" UI */}
                                {step === 3 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                                        <SectionTitle title="Skills & Experience" sub="Search and add your expertise" />
                                        <div className="space-y-6 relative">
                                            <div className="space-y-3 group">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Technical Skills</label>
                                                {/* --- Tags Area --- */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {formData.techSkills.split(',').filter(s => s.trim()).map((skill, index) => (
                                                        <div key={index} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase animate-in zoom-in">
                                                            {skill.trim()}
                                                            <X size={12} className="cursor-pointer hover:text-red-200" onClick={() => {
                                                                const remaining = formData.techSkills.split(',').filter((_, i) => i !== index).join(',');
                                                                setFormData({ ...formData, techSkills: remaining });
                                                            }} />
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* --- Search Input --- */}
                                                <div className="relative group">
                                                    <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus-within:border-blue-600 focus-within:bg-white transition-all">
                                                        <Cpu size={18} className="text-slate-400 group-focus-within:text-blue-600" />
                                                        <input
                                                            id="skill-input"
                                                            value={searchTerm}
                                                            className="bg-transparent outline-none w-full font-bold text-slate-800 placeholder:text-slate-300 text-sm"
                                                            placeholder="Type to search skills (e.g. React)..."
                                                            autoComplete="off"
                                                            onChange={(e) => {
                                                                setSearchTerm(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                    {/* --- Suggestions Dropdown (Google Style) --- */}
                                                    {searchTerm && filteredSuggestions.length > 0 && (
                                                        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            {/* skill: string nu type kuduthuruken, so 'any' error varathu */}
                                                            {filteredSuggestions.map((skill: string) => (
                                                                <button
                                                                    key={skill}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        // Logic to handle comma separated string safely
                                                                        const current = formData.techSkills
                                                                            ? formData.techSkills.split(',').map(s => s.trim()).filter(Boolean)
                                                                            : [];

                                                                        if (!current.includes(skill)) {
                                                                            const newSkills = [...current, skill].join(',');
                                                                            setFormData({ ...formData, techSkills: newSkills });
                                                                        }
                                                                        setSearchTerm("");
                                                                    }}
                                                                    className="w-full text-left px-5 py-3 hover:bg-blue-50 text-sm font-bold text-slate-700 transition-colors flex justify-between group"
                                                                >
                                                                    {skill}
                                                                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 font-black text-[10px]">SELECT</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Input label="Years of Experience" name="years" type="number" value={formData.years} onChange={handleChange} icon={<Clock size={18} />} />
                                                <Input label="Current Company" name="company" value={formData.company} onChange={handleChange} icon={<Briefcase size={18} />} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Step 4: Salary - Range Slider Logic */}
                                {step === 4 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <SectionTitle title="Logistics" sub="Financials & Joining" />
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                            {/* Salary Input */}
                                            <Input
                                                label="Expected Salary (LPA)"
                                                name="expectedSalary"
                                                placeholder="e.g. 4.5"
                                                value={formData.expectedSalary}
                                                onChange={handleChange}
                                                icon={<Banknote size={18} />}
                                            />
                                            {/* Joining Availability Dropdown */}
                                            <div className="space-y-2 group">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1 transition-colors group-focus-within:text-blue-600">
                                                    Joining Availability
                                                </label>
                                                <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 p-4 rounded-[20px] focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-900/5 transition-all duration-300">
                                                    <Clock size={18} className="text-slate-400 mr-3 shrink-0" />
                                                    <select
                                                        name="availability"
                                                        value={formData.availability}
                                                        onChange={handleChange}
                                                        className="bg-transparent outline-none w-full font-bold text-slate-800 text-sm appearance-none cursor-pointer pr-8"                                                   >
                                                        <option value="" disabled>Select your notice period</option>
                                                        <option value="immediate">Immediate Joiner (Within 2-3 days)</option>
                                                        <option value="1week">Within 1 Week</option>
                                                        <option value="15days">15 Days Notice</option>
                                                        <option value="30days">1 Month Notice</option>
                                                        <option value="45days">45 Days Notice</option>
                                                        <option value="above2months">More than 2 Months</option>
                                                    </select>
                                                    {/* Custom Arrow for Dropdown */}
                                                    <div className="absolute right-4 pointer-events-none text-slate-400">
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-medium ml-1">Select how soon you can start working with us.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {step === 5 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SectionTitle title="Final Review" sub="Verify your application details" />
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* --- Profile Card Summary --- */}
                                            <div className="md:col-span-2 bg-[#0F172A] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[50px] -mr-16 -mt-16" />
                                                <div className="relative z-10 flex items-start justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[3px] mb-2">Candidate Profile</p>
                                                        <h3 className="text-3xl font-black tracking-tight">{formData.fullName || 'Not Provided'}</h3>
                                                        <div className="flex items-center gap-4 mt-2 text-slate-400 font-bold text-xs uppercase">
                                                            <span className="flex items-center gap-1"><Mail size={12} /> {formData.email}</span>
                                                            <span className="flex items-center gap-1"><Phone size={12} /> {formData.phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                                        <User size={32} className="text-blue-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* --- Education & Work Summary --- */}
                                            <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <BookOpen size={16} />
                                                    </div>
                                                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">Academic</h4>
                                                </div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Degree</p>
                                                <p className="font-bold text-slate-700 mb-4">{formData.degree || '---'}</p>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Institution</p>
                                                <p className="font-bold text-slate-700">{formData.college || '---'}</p>
                                            </div>
                                            <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">Professional</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                                        <p className="font-bold text-slate-700">{formData.experienceType === 'fresher' ? 'Fresher' : `${formData.years} Years`}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Expectation</p>
                                                        <p className="font-bold text-emerald-600">₹ {formData.expectedSalary} LPA</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* --- Cover Letter / Additional Notes --- */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Why should we hire you?</label>
                                                <textarea
                                                    name="whyHireMe"
                                                    value={formData.whyHireMe}
                                                    onChange={handleChange}
                                                    placeholder="Write a brief note about your passion and goals..."
                                                    className="w-full bg-slate-50 border border-slate-200 p-6 rounded-[24px] outline-none font-bold text-slate-800 text-sm focus:border-blue-600 focus:bg-white h-40 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        {/* --- Submission Agreement --- */}
                                        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                                            <p className="text-[11px] font-bold text-slate-600 leading-tight">
                                                I confirm that all information provided is accurate and I am ready to join the Dotok Communications team.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {step === 6 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[24px] flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Application Sent!</h2>
                                        <p className="text-slate-500 font-medium">We will review your profile and get back to you soon.</p>
                                        <button onClick={handleClose} className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Back to Home</button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
            {/* --- STICKY FOOTER --- */}
            {step < 6 && (
                <footer className="bg-white border-t border-slate-100 px-4 md:px-12 py-4 md:py-0 md:h-24 flex items-center justify-between z-50 shrink-0">
                    <button onClick={step === 1 ? handleClose : prevStep} className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all p-3">
                        <ArrowLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {step} of 5</span>
                        <button
                            onClick={step === 5 ? handleSubmit : nextStep}
                            disabled={isSubmitting}
                            className="bg-[#0F172A] text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : step === 5 ? 'Confirm & Apply' : 'Continue'}
                            {!isSubmitting && <ArrowRight size={16} />}
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}

// Helper Components
function SectionTitle({ title, sub }: { title: string, sub: string }) {
    return (
        <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h2>
            <p className="text-slate-400 mt-1 text-[11px] font-bold uppercase tracking-[2px]">{sub}</p>
        </div>
    );
}

function Input({ label, name, value, onChange, icon }: any) {
    return (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">{label}</label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-sm transition-all">
                <span className="text-slate-400 group-focus-within:text-blue-600 transition-colors">{icon}</span>
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="bg-transparent outline-none w-full font-bold text-slate-800 placeholder:text-slate-300 text-sm"
                    placeholder={`Enter ${label}`}
                />
            </div>
        </div>
    );
}

export default JobApplication;
