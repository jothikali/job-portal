import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Save, Briefcase, Bookmark, Bell } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ProfileMenu from '../../pages/ProfileDropdown';
import { toast } from '../../lib/toast';

export default function EditContact() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        street: "", // State for Street Address
        cityState: "",
        pincode: "",
        role: ""
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = savedUser.id || savedUser.user?.id;

                if (userId) {
                    const response = await axios.get(`http://localhost:5000/api/user/full-profile/${userId}`);
                    const data = response.data;
                    const nameParts = data.name ? data.name.split(" ") : ["", ""];

                    setFormData({
                        firstName: nameParts[0] || "",
                        lastName: nameParts.slice(1).join(" ") || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        street: data.street_address || "", // Database-la irundhu fetch pandrom
                        cityState: data.location || "",
                        pincode: data.pincode || "",
                        role: data.role || ""
                    });
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            // UserId safety check
            const userId = user.id || user.user?.id;

            if (!userId) {
                toast.error("Session expired. Please login again.");
                navigate("/login");
                return;
            }

            // Combining first and last name to send to backend
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const payload = {
                userId: userId,
                name: fullName, // Indha field add panna dhaan login table-la name update aagum
                phone: formData.phone,
                location: formData.cityState,
                role: formData.role,
                street_address: formData.street,
                pincode: formData.pincode
            };

            const response = await axios.put(`http://localhost:5000/api/user/update-profile/${userId}`, payload);

            if (response.status === 200) {
                const updatedUser = {
                    ...user,
                    ...(user.user ? { user: { ...user.user, name: fullName } } : { name: fullName }),
                    role: formData.role,
                    location: formData.cityState,
                    phone: formData.phone,
                    street_address: formData.street,
                    pincode: formData.pincode
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                toast.success("Profile updated successfully!");
                navigate("/profile");
            }
        } catch (error: any) {
            console.error("Update failed:", error.response?.data);
            toast.error(error.response?.data?.message || "Update failed. Check your connection.");
        } finally {
            setLoading(false);
        }
    };
    if (fetching) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            <nav className="bg-[#0F172A] text-white py-5 px-10 shadow-md flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                            <Briefcase className="size-6 text-[#0F172A]" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-white">JobPortal</span>
                    </Link>
                </div>
                <div className="flex items-center gap-8 font-bold text-sm">
                    <ProfileMenu />
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-all">
                    <ArrowLeft size={20} /> Back to Profile
                </button>

                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight italic">Contact information</h2>
                <p className="text-slate-500 font-medium mb-10 italic">Update how employers can reach you.</p>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Name Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First name *</label>
                            <input name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last name *</label>
                            <input name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Role / Headline</label>
                        <input name="role" value={formData.role} onChange={handleChange} placeholder="e.g. Web Development Intern" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone number *</label>
                        <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                    </div>

                    <div className="h-[1px] bg-slate-100 my-8"></div>

                    {/* Location Section */}
                    <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Location</h3>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Street address</label>
                        <input name="street" value={formData.street} onChange={handleChange} placeholder="e.g. 123, Main Street" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City, District *</label>
                            <input name="cityState" required value={formData.cityState} onChange={handleChange} placeholder="e.g. Madurai, Tamil Nadu" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pincode</label>
                            <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="625001" className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all bg-slate-50/50" />
                        </div>
                    </div>

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-[#0F172A] text-white px-16 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}