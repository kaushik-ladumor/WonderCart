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
    TrendingUp,
    X
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
        <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                    <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Mood Collections</h1>
                    <p className="mt-1 text-[0.85rem] text-[#64748b]">Curate your platform's emotional shopping experience through specific moods.</p>
                </div>
                <button 
                    onClick={() => { setEditingMood(null); setFormData({name:"", label:"", emoji:""}); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 h-[42px] px-5 bg-[#11182d] text-white rounded-[10px] text-[10px] font-bold uppercase tracking-wider border border-[#11182d]"
                >
                    <Plus className="h-4 w-4" />
                    Create New Mood
                </button>
            </div>

            {/* Analytics Summary */}
            {analytics && analytics.totalSelections > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-[18px] border border-[#d7dcea] bg-white p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#f8fafc] text-[#0f49d7] border border-[#e2e8f0]">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Platform Favorite</p>
                                <p className="text-[1.1rem] font-bold text-[#11182d]">{analytics.mostSelected?.mood} <span className="text-[#64748b] text-[0.8rem] font-medium">({analytics.mostSelected?.count} uses)</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[18px] border border-[#d7dcea] bg-white p-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <input 
                        type="text" 
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-[10px] bg-white border border-[#d9deeb] py-2 pl-10 pr-4 text-[0.85rem] font-medium text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                    <button 
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-[8px] ${viewMode === "grid" ? "bg-white border border-[#d7dcea] text-[#11182d] shadow-sm" : "text-[#64748b]"}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-[8px] ${viewMode === "list" ? "bg-white border border-[#d7dcea] text-[#11182d] shadow-sm" : "text-[#64748b]"}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Mood Grid/List */}
            {filteredMoods.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-[#d7dcea] py-20 text-center bg-white">
                    <p className="text-[#64748b] font-medium text-[0.85rem]">No moods found matching your search.</p>
                </div>
            ) : (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMoods.map((mood) => (
                            <div key={mood._id} className="relative rounded-[18px] border border-[#d7dcea] bg-white p-6 flex flex-col">
                                <div className="h-12 w-12 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-3xl mb-4">
                                    {mood.emoji}
                                </div>
                                <h3 className="text-[1.1rem] font-bold text-[#11182d]">{mood.label}</h3>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-6">Internal ID: #{mood.name}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f1f5f9]">
                                    <button 
                                        onClick={() => handleToggle(mood._id)}
                                        className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider border transition-colors ${mood.isActive ? 'text-green-600 bg-green-50 border-green-200' : 'text-[#64748b] bg-[#f8fafc] border-[#d7dcea]'}`}
                                    >
                                        {mood.isActive ? 'Active' : 'Hidden'}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(mood)} className="h-8 w-8 flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] rounded-[8px] border border-[#d7dcea] transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => handleDelete(mood._id)} className="h-8 w-8 flex items-center justify-center text-[#64748b] hover:bg-red-50 hover:text-red-600 rounded-[8px] border border-[#d7dcea] transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[18px] border border-[#d7dcea] bg-white">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] text-[10px] font-bold uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                                <tr>
                                    <th className="px-6 py-4">Mood Entity</th>
                                    <th className="px-6 py-4">Descriptor</th>
                                    <th className="px-6 py-4">Visibility</th>
                                    <th className="px-6 py-4 text-right">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {filteredMoods.map((mood) => (
                                    <tr key={mood._id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{mood.emoji}</span>
                                                <span className="text-[0.88rem] font-bold text-[#11182d]">{mood.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[0.85rem] font-medium text-[#64748b]">#{mood.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-[8px] text-[9px] font-bold uppercase tracking-wider border ${mood.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-[#f8fafc] text-[#64748b] border-[#d7dcea]'}`}>
                                                {mood.isActive ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(mood)} className="h-8 w-8 flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] rounded-[8px] border border-[#d7dcea]"><Edit2 className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDelete(mood._id)} className="h-8 w-8 flex items-center justify-center text-[#64748b] hover:bg-red-50 hover:text-red-600 rounded-[8px] border border-[#d7dcea]"><Trash2 className="h-3.5 w-3.5" /></button>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-[420px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-6 pt-6 pb-4">
                            <h2 className="text-[1.2rem] font-bold text-[#11182d]">{editingMood ? 'Configure Mood' : 'Initialize New Mood'}</h2>
                            <p className="text-[0.84rem] text-[#6d7892] mt-1">Define the visual and emotional metadata for this collection.</p>
                            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                            <div>
                                <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">Visual Label</label>
                                <input 
                                    className="w-full rounded-xl bg-white border border-[#d9deeb] py-2.5 px-4 text-[0.88rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]"
                                    placeholder="e.g. Summer Vacation"
                                    value={formData.label}
                                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                                    required
                                />
                            </div>
                            
                            {!editingMood && (
                                <div>
                                    <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">Internal Protocol ID</label>
                                    <input 
                                        className="w-full rounded-xl bg-white border border-[#d9deeb] py-2.5 px-4 text-[0.88rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]"
                                        placeholder="e.g. summer-vacation"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">Graphic Emoji</label>
                                <input 
                                    className="w-full rounded-xl bg-white border border-[#d9deeb] py-2.5 px-4 text-[0.88rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]"
                                    placeholder="Select an emoji..."
                                    value={formData.emoji}
                                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3] transition-colors mt-2"
                            >
                                {editingMood ? 'Synchronize Updates' : 'Commit New Mood'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMoods;
