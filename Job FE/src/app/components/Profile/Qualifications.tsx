import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Briefcase, GraduationCap, Star, ShieldCheck, Award,
    Globe, Plus, ArrowLeft, X, Bookmark, Bell, Search, Trash2, Pencil
} from 'lucide-react';
import ProfileMenu from '../../pages/ProfileDropdown';
import { toast } from '../../lib/toast';

const Qualifications = () => {
    const navigate = useNavigate();

    // --- STATES ---
    const [savedData, setSavedData] = useState<any[]>([]); // DB data store panna
    const [editingId, setEditingId] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [mainValue, setMainValue] = useState('');
    const [subValue, setSubValue] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [monthValue, setMonthValue] = useState('');
    const [yearValue, setYearValue] = useState('');
    const [doesNotExpire, setDoesNotExpire] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [fieldSuggestions, setFieldSuggestions] = useState<string[]>([]);
    const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);

    // --- 1. FETCH DATA FUNCTION (UI Display-ku idhu thaan mukkiyam) ---
    const fetchQualifications = async () => {
        try {
            // Replace with your actual API endpoint to get all qualifications for the user
            const res = await axios.get('http://localhost:5000/api/qualifications/all/1');
            setSavedData(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchQualifications();
    }, []);

    // --- SEARCH LOGIC ---
    const handleSearch = async (val: string, type: string, target: 'main' | 'field' | 'sub' = 'main') => {
        if (target === 'main') setMainValue(val);
        else if (target === 'field') setFieldOfStudy(val);
        else if (target === 'sub') setSubValue(val);

        if (val.length > 0) {
            try {
                let endpoint = '';
                if (activeModal === 'lic' && target === 'main') endpoint = `http://localhost:5000/api/jobs/driving-licenses?q=${val}`;
                else if (activeModal === 'cert' && target === 'main') endpoint = `http://localhost:5000/api/jobs/certifications?q=${val}`;
                else if (activeModal === 'lang' && target === 'main') endpoint = `http://localhost:5000/api/jobs/languages?q=${val}`;
                else if (target === 'sub') endpoint = `http://localhost:5000/api/jobs/company-suggestions?q=${val}`;
                else if (type === 'edu') {
                    if (target === 'main') endpoint = `http://localhost:5000/api/jobs/edu-levels?q=${val}`;
                    else if (target === 'field') endpoint = `http://localhost:5000/api/jobs/edu-fields?q=${val}`;
                } else if (type === 'skill' && target === 'main') endpoint = `http://localhost:5000/api/skills/suggestions?q=${val}`;
                else if (type === 'work' && target === 'main') endpoint = `http://localhost:5000/api/skills/experience-suggestions?q=${val}`;

                if (endpoint) {
                    const res = await axios.get(endpoint);
                    if (target === 'main') setSuggestions(res.data);
                    else if (target === 'field') setFieldSuggestions(res.data);
                    else if (target === 'sub') setCompanySuggestions(res.data);
                }
            } catch (err) { console.error("Search error:", err); }
        } else {
            if (target === 'main') setSuggestions([]);
            else if (target === 'field') setFieldSuggestions([]);
            else if (target === 'sub') setCompanySuggestions([]);
        }
    };

    // --- 2. SAVE LOGIC (Save panna odane display aaga refresh call pannum) ---
    const handleSave = async (stayOpen = false) => {
        if (!mainValue) return;

        try {
            const payload = {
                user_id: 1, // Add your user ID logic
                type: activeModal,
                main_value: mainValue,
                sub_value: subValue,
                field_of_study: fieldOfStudy,
                month_val: monthValue,
                year_val: yearValue,
                no_expire: doesNotExpire
            };

            // Common save endpoint
            await axios.post('http://localhost:5000/api/qualifications/add', payload);

            if (activeModal === 'skill') {
                await axios.post('http://localhost:5000/api/skills/save', { skill_name: mainValue });
            }

            toast.success(`${activeModal} saved successfully!`);
            await fetchQualifications();

            if (stayOpen) {
                resetFields();
            } else {
                setActiveModal(null);
                resetFields();
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save. Check your connection.");
        }
    };

    const resetFields = () => {
        setMainValue(''); setSubValue(''); setFieldOfStudy('');
        setMonthValue(''); setYearValue(''); setDoesNotExpire(false);
        setSuggestions([]); setFieldSuggestions([]); setCompanySuggestions([]);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this?")) {
            setActiveModal(null);
        }
    };

    const sections = [
        { id: "work", title: "Add most recent work experience", icon: <Briefcase size={20} /> },
        { id: "edu", title: "Add education", icon: <GraduationCap size={20} /> },
        { id: "skill", title: "Add skill", icon: <Star size={20} /> },
        { id: "lic", title: "Add licences", icon: <ShieldCheck size={20} /> },
        { id: "cert", title: "Add certifications", icon: <Award size={20} /> },
        { id: "lang", title: "Add languages", icon: <Globe size={20} /> },
    ];

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 30 }, (_, i) => (2026 - i).toString());

    return (
        <div className="min-h-screen bg-[#F3F2F1] font-sans relative text-[#2D2D2D]">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                            <Briefcase className="size-6 text-[#0F172A]" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-white">JobPortal</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-10 text-[16px] font-bold">
                        <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                        <Link to="/reviews" className="text-slate-300 hover:text-white transition-colors">Company reviews</Link>
                    </div>
                </div>
                <div className="flex items-center gap-8 font-bold text-sm">
                    <div className="flex items-center gap-6">
                        <Link to="/my-jobs" className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bookmark size={22} /></Link>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white"><Bell size={22} /></button>
                        <ProfileMenu />
                    </div>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Employers | Post Job</Link>
                </div>
            </nav>
<main className="pt-[85px] flex-1">
           <div className="bg-[#F3F2F1] px-6 py-6">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 font-semibold hover:underline"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to profile
                </button>
            </div>
        </div>

            <main className="max-w-3xl mx-auto px-6 mt-10 pb-20">
                <h1 className="text-[32px] font-black text-[#2D2D2D] mb-6 tracking-tight">Qualifications</h1>
                <div className="space-y-4">
                    {sections.map((section) => {
                        // --- 3. DISPLAY LOGIC (Saved Data-va kaata) ---
                        const sectionItems = savedData.filter(item => item.type === section.id);

                        return (
                            <div key={section.id} className="bg-white rounded-2xl border border-[#D4D2D0] overflow-hidden">
                                {sectionItems.length > 0 ? (
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-[18px] font-black text-[#2D2D2D]">{section.title.replace('Add ', '')}</h2>
                                            <Plus className="text-[#2557a7] cursor-pointer" onClick={() => setActiveModal(section.id)} />
                                        </div>
                                        <div className="space-y-4">
                                            {sectionItems.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                                                    <div>
                                                        <h3 className="font-bold text-[#2D2D2D]">{item.main_value}</h3>
                                                        <p className="text-gray-600 text-sm">{item.sub_value || item.field_of_study}</p>
                                                        <p className="text-gray-400 text-xs">{item.month_val} {item.year_val}</p>
                                                    </div>
                                                    <Pencil size={16} className="text-gray-400 cursor-pointer" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => { setActiveModal(section.id); resetFields(); }}
                                        className="flex items-center justify-between p-5 cursor-pointer group hover:bg-gray-50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-[#F3F2F1] rounded-xl text-slate-500 group-hover:text-[#2557a7] transition-all">{section.icon}</div>
                                            <span className="text-[#2557a7] font-black text-[18px] tracking-tight">{section.title}</span>
                                        </div>
                                        <div className="text-slate-400 group-hover:text-[#2557a7] transition-all"><Plus size={24} /></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* --- MODAL POPUP --- */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[750px] rounded-[0.8rem] shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b shrink-0">
                            <h2 className="text-[22px] font-bold text-[#2D2D2D]">Add {activeModal}</h2>
                            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-grow" style={{ overflow: 'visible' }}>
                            <div className="space-y-6">
                                <div className="relative z-[30]">
                                    <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">
                                        {activeModal === 'work' ? 'Job title *' : activeModal === 'edu' ? 'Level of education *' : activeModal === 'lic' ? 'Licence name *' : activeModal === 'cert' ? 'Certification name *' : 'Name *'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text" value={mainValue} autoComplete="off"
                                            onChange={(e) => handleSearch(e.target.value, activeModal || '')}
                                            className="w-full p-3 border-2 border-[#D4D2D0] rounded-md focus:border-[#2557a7] outline-none font-medium text-[16px]"
                                            placeholder="Enter name/title"
                                        />
                                        {!mainValue && <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                                    </div>
                                    {suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[100%] mt-1 bg-white border border-gray-200 shadow-xl rounded-xl z-[9999] max-h-[200px] overflow-y-auto">
                                            {suggestions.map((s, i) => (
                                                <div key={i} onClick={() => { setMainValue(s); setSuggestions([]); }} className="px-5 py-3 hover:bg-[#F3F2F1] cursor-pointer font-bold text-[#2D2D2D]">{s}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {activeModal === 'work' && (
                                    <div className="relative">
                                        <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">Company *</label>
                                        <div className="relative">
                                            <input
                                                type="text" value={subValue} autoComplete="off"
                                                onChange={(e) => handleSearch(e.target.value, activeModal || '', 'sub')}
                                                className="w-full p-3 border-2 border-[#D4D2D0] rounded-md focus:border-[#2557a7] outline-none font-medium text-[16px]"
                                                placeholder="Enter company name"
                                            />
                                            {!subValue && <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                                        </div>
                                        {companySuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-[102%] bg-white border border-gray-200 shadow-xl rounded-lg z-[9999] max-h-[220px] overflow-y-auto">
                                                {companySuggestions.map((suggestion, index) => (
                                                    <div key={index} onClick={() => { setSubValue(suggestion); setCompanySuggestions([]); }} className="px-5 py-3 hover:bg-[#F3F2F1] cursor-pointer font-bold text-[#2D2D2D] flex items-center gap-3">
                                                        <Search size={14} className="text-gray-400" /> {suggestion}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeModal === 'edu' && (
                                    <div className="relative z-[25]">
                                        <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">Field of study *</label>
                                        <div className="relative">
                                            <input
                                                type="text" value={fieldOfStudy} autoComplete="off"
                                                onChange={(e) => handleSearch(e.target.value, activeModal || '', 'field')}
                                                className="w-full p-3 border-2 border-[#D4D2D0] rounded-md focus:border-[#2557a7] outline-none font-medium text-[16px]"
                                                placeholder="e.g. Computer Science"
                                            />
                                            {!fieldOfStudy && <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                                        </div>
                                        {fieldSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-[100%] mt-1 bg-white border border-gray-200 shadow-xl rounded-xl z-[9999] max-h-[200px] overflow-y-auto">
                                                {fieldSuggestions.map((s, i) => (
                                                    <div key={i} onClick={() => { setFieldOfStudy(s); setFieldSuggestions([]); }} className="px-5 py-3 hover:bg-[#F3F2F1] cursor-pointer font-bold text-[#2D2D2D]">{s}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(activeModal === 'lic' || activeModal === 'cert') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">Month</label>
                                            <select value={monthValue} onChange={(e) => setMonthValue(e.target.value)} className="w-full p-3 border-2 border-[#D4D2D0] rounded-md bg-white font-medium text-[16px]">
                                                <option value="">Month</option>
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">Year</label>
                                            <select value={yearValue} onChange={(e) => setYearValue(e.target.value)} className="w-full p-3 border-2 border-[#D4D2D0] rounded-md bg-white font-medium text-[16px]">
                                                <option value="">Year</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {(activeModal === 'lic' || activeModal === 'cert') && (
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="noExpire" checked={doesNotExpire} onChange={(e) => setDoesNotExpire(e.target.checked)} className="w-5 h-5 accent-[#2557a7]" />
                                        <label htmlFor="noExpire" className="text-[15px] font-bold text-[#2D2D2D] cursor-pointer">This license/certification does not expire</label>
                                    </div>
                                )}

                                {activeModal === 'lang' && (
                                    <div>
                                        <label className="block text-[14px] font-bold mb-1.5 text-[#2D2D2D]">Proficiency</label>
                                        <select value={subValue} onChange={(e) => setSubValue(e.target.value)} className="w-full p-3 border-2 border-[#D4D2D0] rounded-md focus:border-[#2557a7] outline-none font-medium text-[16px] bg-white">
                                            <option value="">Select proficiency</option>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Expert</option>
                                            <option>Fluent</option>
                                            <option>Native</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-white flex items-center justify-between shrink-0 rounded-b-[0.8rem]">
                            <div>
                                {activeModal === 'work' && (
                                    <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-md transition-colors">
                                        <Trash2 size={20} /> Delete
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveModal(null)} className="px-5 py-2 font-bold text-[#2557a7] hover:bg-blue-50 rounded-md">Cancel</button>
                                {activeModal !== 'work' && (
                                    <button onClick={() => handleSave(true)} className="px-5 py-2.5 border-2 border-[#2557a7] text-[#2557a7] font-bold rounded-full hover:bg-blue-50 transition-all">Save and add another</button>
                                )}
                                <button onClick={() => handleSave(false)} className="px-8 py-2.5 bg-[#2557a7] hover:bg-[#164081] text-white font-bold rounded-full transition-all">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
};

export default Qualifications;