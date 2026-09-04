import BrandLogo from '../BrandLogo';
import { API } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Bookmark, Bell, Briefcase,
    Plus, UserRound, Clock, Banknote, MapPin, Home, Eye, X
} from 'lucide-react';
import ProfileMenu from '../../pages/ProfileDropdown';
import { Edit2 } from 'lucide-react';
import { toast } from '../../lib/toast';

const JobPreferences = () => {
    const navigate = useNavigate();

    // States for Modals
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isRelocationModalOpen, setIsRelocationModalOpen] = useState(false);
    const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);

    // Data States
    const [jobTitles, setJobTitles] = useState(['Fresher']);
    const [masterTitles, setMasterTitles] = useState<string[]>([]); // DB master data
    const [savedJobTitles, setSavedJobTitles] = useState<string[]>([]);
    const [savedJobTypes, setSavedJobTypes] = useState<string[]>([]);
    const [payType, setPayType] = useState<string>('Per month');
    const [savedSchedule, setSavedSchedule] = useState<string[]>([]);
    const [savedPay, setSavedPay] = useState<string>('');

    const [savedRemote, setSavedRemote] = useState<string[]>([]);
    const [tempTitles, setTempTitles] = useState<string[]>(['']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Inga unga actual userId varanum
                const userId = 123;

                // 1. Master titles fetch panradhu
                const masterRes = await axios.get(`${API}/jobs/master-titles`);
                setMasterTitles(masterRes.data);

                // 2. Refresh pannalum data varadhuku ithu thaan mukkiyam
                const savedRes = await axios.get(`${API}/jobs/get-preferences/${userId}`);

                if (savedRes.data) {
                    // Backend-la 'job_title' nu irundha adhai split panni state-la vachikanum
                    if (savedRes.data.job_title) {
                        setSavedJobTitles(savedRes.data.job_title.split(','));
                    }
                    if (savedRes.data.job_types) {
                        setSavedJobTypes(savedRes.data.job_types.split(','));
                    }
                    if (savedRes.data.work_schedule) {
                        setSavedSchedule(savedRes.data.work_schedule.split(','));
                    }
                    if (savedRes.data.min_pay) {
                        setSavedPay(savedRes.data.min_pay);
                    }
                    // Remote and Relocation settings
                    if (savedRes.data.remote) {
                        setSavedRemote(savedRes.data.remote.split(','));
                    }
                    if (savedRes.data.is_willing_to_relocate !== undefined) {
                        setIsWillingToRelocate(!!savedRes.data.is_willing_to_relocate);
                    }
                }
            } catch (err) {
                console.error("Refresh pannumpo data fetch aagala:", err);
            }
        };
        fetchData();
    }, []);

    // Individual Toggle Helper
    const toggleItem = (currentList: string[], setList: Function, item: string) => {
        if (currentList.includes(item)) {
            setList(currentList.filter(i => i !== item));
        } else {
            setList([...currentList, item]);
        }
    };

    const handleSaveAll = async () => {
        try {
            const payload = {
                userId: 123,
                jobTitles: tempTitles.filter(t => t.trim() !== '').join(','),
                jobTypes: savedJobTypes.join(','),
                workSchedule: savedSchedule.join(','),
                minPay: savedPay,
                remote: savedRemote.join(','),
                isWillingToRelocate: isWillingToRelocate ? 1 : 0
            };

            await axios.post(`${API}/jobs/save-preferences`, payload);

            setSavedJobTitles(tempTitles.filter(t => t.trim() !== ''));
            setIsTitleModalOpen(false);
            setIsTypeModalOpen(false);
            setIsScheduleModalOpen(false);
            setIsPayModalOpen(false);
            setIsRelocationModalOpen(false);
            setIsRemoteModalOpen(false);
            toast.success("Preferences saved!");
        } catch (err) {
            console.error("Save failed", err);
            toast.error("Failed to save preferences.");
        }
    };
    // Relocation Specific Logic
    const [isWillingToRelocate, setIsWillingToRelocate] = useState(false);

    return (
        <div className="min-h-screen bg-[#F3F2F1] flex flex-col relative font-sans text-[#2d2d2d]">

            {/* --- 1. FIXED HEADER --- */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <BrandLogo />
                    </Link>

                    <div className="hidden md:flex items-center gap-10 text-[16px] font-bold">
                        <Link to="/home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                        <Link to="/reviews" className="text-slate-300 hover:text-white transition-colors">Company reviews</Link>
                    </div>
                </div>

                <div className="flex items-center gap-8 font-bold text-sm">
                    <div className="flex items-center gap-6">
                        <Link to="/my-jobs" className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                            <Bookmark size={22} />
                        </Link>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                            <Bell size={22} />
                        </button>
                        <ProfileMenu />
                    </div>
                    <div className="h-5 w-[1px] bg-white/20"></div>
                    <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                        Employers | Post Job
                    </Link>
                </div>
            </nav>

            {/* --- 2. MAIN CONTENT AREA --- */}
            <main className="pt-[90px] flex-1">

                <div className="bg-[#F3F2F1] px-6 py-6">
                    <div className="max-w-[700px] mx-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-[#2557a7] font-bold hover:underline group"
                        >
                            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                            Back to profile
                        </button>
                    </div>
                </div>

                <div className="max-w-[700px] mx-auto px-6 pb-20">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#d4d2d0] overflow-hidden p-[32px]">
                        <h1 className="text-[30px] font-black text-[#2d2d2d] mb-2">Job preferences</h1>
                        <p className="text-[#6f6f6f] text-[16px] mb-8 font-medium">
                            Sharing preferences helps connect you with relevant jobs and employers.
                        </p>

                        <div className="divide-y divide-[#ececec]">
                            {[
                                {
                                    title: 'Job titles',
                                    value: savedJobTitles.join(', '),
                                    hasData: savedJobTitles.length > 0,
                                    Icon: UserRound,
                                    action: () => {
                                        setTempTitles(savedJobTitles.length > 0 ? savedJobTitles : ['']);
                                        setIsTitleModalOpen(true);
                                    }
                                },
                                {
                                    title: 'Job types',
                                    value: savedJobTypes.join(', '),
                                    hasData: savedJobTypes.length > 0,
                                    Icon: Briefcase,
                                    action: () => setIsTypeModalOpen(true)
                                },
                                {
                                    title: 'Work schedule',
                                    value: savedSchedule.join(', '),
                                    hasData: savedSchedule.length > 0,
                                    Icon: Clock,
                                    action: () => setIsScheduleModalOpen(true)
                                },
                                {
                                    title: 'Minimum base pay',
                                    value: savedPay ? `₹${savedPay} ${payType}` : '',
                                    hasData: !!savedPay,
                                    Icon: Banknote,
                                    action: () => setIsPayModalOpen(true)
                                },
                                {
                                    title: 'Relocation',
                                    value: isWillingToRelocate ? 'Willing to relocate' : '',
                                    hasData: isWillingToRelocate,
                                    Icon: MapPin,
                                    action: () => setIsRelocationModalOpen(true)
                                },
                                {
                                    title: 'Remote',
                                    value: savedRemote.join(', '),
                                    hasData: savedRemote.length > 0,
                                    Icon: Home,
                                    action: () => setIsRemoteModalOpen(true)
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={item.action}
                                    className="group flex items-center justify-between py-[20px] cursor-pointer hover:bg-[#f3f2f1]/50 transition-all px-4 -mx-4 rounded-lg"
                                >
                                    <div className="flex items-center gap-5">
                                        <item.Icon className="text-[#2d2d2d]" size={22} />
                                        <div className="flex flex-col text-left">
                                            {/* Title (Always Bold) */}
                                            <span className={`text-[16px] font-bold ${item.hasData ? 'text-[#2d2d2d]' : 'text-[#2557a7]'}`}>
                                                {item.hasData ? item.title : `Add ${item.title.toLowerCase()}`}
                                            </span>

                                            {/* Value (Selected Data in Gray) */}
                                            {item.hasData && (
                                                <span className="text-[14px] text-[#6f6f6f] mt-1 font-medium">
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side Icon */}
                                    {item.hasData ? (
                                        <Edit2 size={18} className="text-[#2d2d2d]" />
                                    ) : (
                                        <Plus size={20} className="text-[#2557a7]" strokeWidth={2.5} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- RENDER ALL MODALS --- */}
            {isTitleModalOpen && (
                <ModalWrapper
                    title="Add job titles"
                    onClose={() => setIsTitleModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <label className="block text-[16px] font-bold text-gray-800 mb-4">What are your desired job titles?</label>
                    <p className="text-xs text-gray-500 mb-3 font-semibold">Add up to ten job titles</p>

                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {tempTitles.map((title, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    list="titles-list"
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        const updated = [...tempTitles];
                                        updated[index] = e.target.value;
                                        setTempTitles(updated);
                                    }}
                                    placeholder="e.g. Front End Developer"
                                    className="flex-1 border-2 border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-blue-600 transition-all"
                                />
                                {tempTitles.length > 1 && (
                                    <X onClick={() => setTempTitles(tempTitles.filter((_, i) => i !== index))} className="cursor-pointer text-gray-400 hover:text-red-500" size={20} />
                                )}
                            </div>
                        ))}

                        <datalist id="titles-list">
                            {masterTitles.map((m, i) => (
                                <option key={i} value={m} />
                            ))}
                        </datalist>
                    </div>

                    <button
                        onClick={() => setTempTitles([...tempTitles, ''])}
                        className="mt-6 flex items-center text-blue-600 font-bold gap-1.5"
                        disabled={tempTitles.length >= 10}
                    >
                        <Plus size={22} /> Add another
                    </button>
                </ModalWrapper>
            )}

            {/* 2. Job Types Modal */}
            {isTypeModalOpen && (
                <ModalWrapper
                    title="Add job types"
                    onClose={() => setIsTypeModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <p className="font-bold mb-4">What are your desired job types?</p>
                    {['Full-time', 'Permanent', 'Fresher', 'Part-time', 'Internship', 'Freelance'].map(t => (
                        <label key={t} className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                className="size-5 rounded border-gray-300 accent-blue-600"
                                checked={savedJobTypes.includes(t)}
                                onChange={() => toggleItem(savedJobTypes, setSavedJobTypes, t)}
                            />
                            <span className="text-gray-700 font-medium">{t}</span>
                        </label>
                    ))}
                </ModalWrapper>
            )}

            {/* 3. Schedule Modal */}
            {isScheduleModalOpen && (
                <ModalWrapper
                    title="Add work schedule"
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <p className="font-bold text-[16px] text-[#2d2d2d] mb-6">What are your desired schedules?</p>

                    <div className="mb-6">
                        <h3 className="text-[12px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-4">Days</h3>
                        {['Monday to Friday', 'Weekend availability', 'Weekend only'].map(d => (
                            <label key={d} className="flex items-center gap-4 py-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={savedSchedule.includes(d)}
                                    onChange={() => toggleItem(savedSchedule, setSavedSchedule, d)}
                                    className="size-5 rounded border-[#d4d2d0] accent-[#2557a7]"
                                />
                                <span className="text-[16px] text-[#2d2d2d] group-hover:text-[#2557a7]">{d}</span>
                            </label>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-[#ececec]">
                        <h3 className="text-[12px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-4">Shifts</h3>
                        {['Day shift', 'Morning shift', 'Rotational shift', 'Night shift', 'Fixed shift'].map(s => (
                            <label key={s} className="flex items-center gap-4 py-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={savedSchedule.includes(s)}
                                    onChange={() => toggleItem(savedSchedule, setSavedSchedule, s)}
                                    className="size-5 rounded border-[#d4d2d0] accent-[#2557a7]"
                                />
                                <span className="text-[16px] text-[#2d2d2d] group-hover:text-[#2557a7]">{s}</span>
                            </label>
                        ))}
                    </div>
                </ModalWrapper>
            )}

            {/* 4. Pay Modal */}
            {isPayModalOpen && (
                <ModalWrapper
                    title="Add pay"
                    onClose={() => setIsPayModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <p className="font-bold mb-4 text-[#2d2d2d]">What is the minimum pay you'll consider?</p>
                    <div className="relative mb-6">
                        <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                        <input
                            type="number"
                            value={savedPay}
                            onChange={(e) => setSavedPay(e.target.value)}
                            placeholder="Amount"
                            className="w-full border-2 border-[#d4d2d0] rounded-xl p-3.5 pl-8 outline-none focus:border-[#2557a7] transition-all"
                        />
                    </div>

                    <p className="text-[14px] font-bold text-[#6f6f6f] mb-3 uppercase tracking-wide">Rate</p>
                    <div className="flex flex-wrap gap-3">
                        {['Per hour', 'Per month', 'Per year'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPayType(p)}
                                className={`px-5 py-2.5 border-2 rounded-full text-sm font-bold transition-all ${payType === p
                                        ? 'border-[#2557a7] text-[#2557a7] bg-[#2557a7]/5'
                                        : 'border-[#d4d2d0] text-[#6f6f6f] hover:border-[#6f6f6f]'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </ModalWrapper>
            )}

            {/* 5. Relocation Modal */}
            {isRelocationModalOpen && (
                <ModalWrapper
                    title="Add relocation"
                    onClose={() => setIsRelocationModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <p className="font-bold text-[16px] text-[#2d2d2d] mb-6">Are you willing to relocate?</p>

                    <label className="flex items-center gap-4 mb-6 font-bold cursor-pointer p-1">
                        <input
                            type="checkbox"
                            checked={isWillingToRelocate}
                            onChange={(e) => setIsWillingToRelocate(e.target.checked)}
                            className="size-6 rounded border-[#d4d2d0] accent-[#2557a7]"
                        />
                        <span className="text-[17px]">Yes, I'm willing to relocate</span>
                    </label>

                    {isWillingToRelocate && (
                        <div className="ml-10 space-y-5 animate-in slide-in-from-top-2 duration-300">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input type="radio" name="reloc" className="size-5 accent-[#2557a7]" defaultChecked />
                                <span className="text-[16px] text-[#2d2d2d] group-hover:text-[#2557a7]">Anywhere in India</span>
                            </label>
                            <div className="space-y-4">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <input type="radio" name="reloc" className="size-5 accent-[#2557a7]" />
                                    <span className="text-[16px] text-[#2d2d2d] group-hover:text-[#2557a7]">Desired Work Location</span>
                                </label>
                                <div className="ml-9">
                                    <p className="text-[12px] text-[#6f6f6f] mb-2 font-medium">Add up to 3 cities.</p>
                                    <input
                                        type="text"
                                        placeholder="City, State"
                                        className="w-full border border-[#2d2d2d] rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#2557a7]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </ModalWrapper>
            )}

            {/* 6. Remote Modal */}
            {isRemoteModalOpen && (
                <ModalWrapper
                    title="Add remote"
                    onClose={() => setIsRemoteModalOpen(false)}
                    onSave={handleSaveAll}
                >
                    <p className="font-bold text-[16px] text-[#2d2d2d] mb-6">Desired work setting</p>
                    <div className="space-y-2">
                        {['Remote', 'Hybrid work', 'In-person'].map(r => (
                            <label key={r} className="flex items-center gap-4 py-[14px] px-2 cursor-pointer hover:bg-[#f3f2f1] rounded-lg transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={savedRemote.includes(r)}
                                    onChange={() => toggleItem(savedRemote, setSavedRemote, r)}
                                    className="size-5 rounded border-[#d4d2d0] accent-[#2557a7]"
                                />
                                <span className="text-[16px] font-bold text-[#2d2d2d] group-hover:text-[#2557a7]">{r}</span>
                            </label>
                        ))}
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
};

// Reusable Modal Wrapper
const ModalWrapper = ({ title, children, onClose, onSave }: { title: string, children: React.ReactNode, onClose: () => void, onSave?: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-[540px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-[#ececec]">
                <h2 className="text-[20px] font-bold text-[#2d2d2d]">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-[#f3f2f1] rounded-full transition-colors"><X size={22} className="text-[#2d2d2d]" /></button>
            </div>
            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
            <div className="flex justify-end gap-3 p-5 bg-[#f3f2f1] border-t border-[#d4d2d0]">
                <button onClick={onClose} className="px-6 py-2.5 font-bold text-[#2557a7] hover:bg-gray-200 rounded-lg transition-all">Cancel</button>
                <button onClick={onSave || onClose} className="px-8 py-2.5 bg-[#2557a7] text-white font-bold rounded-lg hover:bg-[#164081] shadow-md transition-all active:scale-95">Save</button>
            </div>
        </div>
    </div>
);

export default JobPreferences;