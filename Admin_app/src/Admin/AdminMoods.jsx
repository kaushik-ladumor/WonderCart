import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Eye, 
    EyeOff, 
    Sparkles, 
    LayoutGrid, 
    List,
    TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../utils/constants";

const AdminMoods = () => {
    console.log("AdminMoods Component Initializing...");
    
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [searchQuery, setSearchQuery] = useState("");
    const [analytics, setAnalytics] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [editingMood, setEditingMood] = useState(null);
    const [formData, setFormData] = useState({ name: "", label: "", emoji: "" });

    const fetchMoods = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/mood/all`);
            setMoods(res.data.data || []);
            
            const analyticsRes = await axios.get(`${API_URL}/mood/analytics`);
            setAnalytics(analyticsRes.data.data);
        } catch (error) {
            console.error("Moods fetch error:", error);
            toast.error("Failed to load moods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, []);

    const handleToggle = async (id) => {
        try {
            await axios.patch(`${API_URL}/mood/${id}/toggle`);
            setMoods(prev => prev.map(m => m._id === id ? { ...m, isActive: !m.isActive } : m));
            toast.success("Visibility updated");
        } catch (error) {
            toast.error("Failed to toggle status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove this mood from all products!")) return;
        try {
            await axios.delete(`${API_URL}/mood/${id}`);
            setMoods(prev => prev.filter(m => m._id !== id));
            toast.success("Mood deleted successfully");
        } catch (error) {
            toast.error("Failed to delete mood");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMood) {
                await axios.put(`${API_URL}/mood/${editingMood._id}`, formData);
                toast.success("Mood updated");
            } else {
                await axios.post(`${API_URL}/mood`, formData);
                toast.success("Mood created successfully");
            }
            setShowModal(false);
            setEditingMood(null);
            setFormData({ name: "", label: "", emoji: "" });
            fetchMoods();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const openEdit = (mood) => {
        setEditingMood(mood);
        setFormData({ name: mood.name, label: mood.label, emoji: mood.emoji });
        setShowModal(true);
    };

    const filteredMoods = moods.filter(m => 
        m.name.includes(searchQuery.toLowerCase()) || 
        m.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-[24px] font-bold text-[#0f172a]">Mood Collections</h1>
                    <p className="text-[14px] font-medium text-[#64748b]">Curate your platform's emotional shopping experience.</p>
                </div>
                <button 
                    onClick={() => { setEditingMood(null); setFormData({name:"", label:"", emoji:""}); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 rounded-[18px] bg-[#2563eb] px-5 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-blue-100 hover:bg-[#1d4ed8] transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Create New Mood
                </button>
            </div>

            {/* Analytics Summary */}
            {analytics && analytics.totalSelections > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[12px] font-bold uppercase tracking-wider text-[#94a3b8]">Most Popular</p>
                                <p className="text-[18px] font-bold text-[#1e293b]">{analytics.mostSelected?.mood} ({analytics.mostSelected?.count})</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[24px] border border-[#e2e8f0] bg-white p-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <input 
                        type="text" 
                        placeholder="Search moods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-[14px] bg-[#f8fafc] border border-transparent py-2.5 pl-11 pr-4 text-[13px] font-medium transition-all focus:border-[#2563eb] focus:bg-white focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-[#f1f5f9] rounded-[14px]">
                    <button 
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-[10px] transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#2563eb]" : "text-[#64748b]"}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-[10px] transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#2563eb]" : "text-[#64748b]"}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mood Grid/List */}
            {filteredMoods.length === 0 ? (
                <div className="rounded-[32px] border border-dashed border-[#e2e8f0] py-20 text-center">
                    <p className="text-[#64748b] font-medium">No moods found matching your search.</p>
                </div>
            ) : (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMoods.map((mood) => (
                            <div key={mood._id} className="group relative rounded-[28px] border border-[#e2e8f0] bg-white p-6 transition-all hover:shadow-lg">
                                <span className="text-4xl block mb-4">{mood.emoji}</span>
                                <h3 className="text-[18px] font-bold text-[#0f172a]">{mood.label}</h3>
                                <p className="text-[12px] font-medium text-[#94a3b8] uppercase tracking-wider mb-6">#{mood.name}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <button 
                                        onClick={() => handleToggle(mood._id)}
                                        className={`p-2 rounded-xl transition-all ${mood.isActive ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
                                    >
                                        {mood.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(mood)} className="p-2 text-[#64748b] hover:text-[#2563eb] rounded-xl"><Edit2 className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(mood._id)} className="p-2 text-[#64748b] hover:text-red-500 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                                <tr>
                                    <th className="px-6 py-4">Mood</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {filteredMoods.map((mood) => (
                                    <tr key={mood._id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span>{mood.emoji}</span>
                                                <span className="text-[14px] font-bold text-[#1e293b]">{mood.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-[#64748b]">#{mood.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${mood.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {mood.isActive ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleToggle(mood._id)} className="p-2 text-[#64748b] hover:text-blue-500 rounded-xl"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => openEdit(mood)} className="p-2 text-[#64748b] hover:text-blue-500 rounded-xl"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(mood._id)} className="p-2 text-[#64748b] hover:text-red-500 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8">
                        <h2 className="text-[20px] font-bold mb-6">{editingMood ? 'Edit Mood' : 'New Mood'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                className="w-full rounded-[16px] border border-[#e2e8f0] px-4 py-3 placeholder:text-gray-300 outline-none focus:border-[#2563eb]"
                                placeholder="Mood Label (e.g. Vacation)"
                                value={formData.label}
                                onChange={(e) => setFormData({...formData, label: e.target.value})}
                                required
                            />
                            {!editingMood && (
                                <input 
                                    className="w-full rounded-[16px] border border-[#e2e8f0] px-4 py-3 placeholder:text-gray-300 outline-none focus:border-[#2563eb]"
                                    placeholder="Internal ID (e.g. vacation)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                    required
                                />
                            )}
                            <input 
                                className="w-full rounded-[16px] border border-[#e2e8f0] px-4 py-3 placeholder:text-gray-300 outline-none focus:border-[#2563eb]"
                                placeholder="Emoji (e.g. 🏖️)"
                                value={formData.emoji}
                                onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                                required
                            />
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[14px] font-bold text-[#64748b]">Cancel</button>
                                <button type="submit" className="flex-1 rounded-[18px] bg-[#2563eb] py-3 text-[14px] font-bold text-white">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMoods;
