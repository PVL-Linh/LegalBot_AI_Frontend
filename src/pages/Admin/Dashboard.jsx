import { useEffect, useState } from 'react';
import { Users, FileText, Activity, Server, Clock, ChevronRight, ArrowUpRight, ShieldCheck, Database, Plus } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        conversations: 0,
        documents: 0,
        system_health: 'Đang tải...'
    });
    const [analytics, setAnalytics] = useState([]);
    const [recentDocs, setRecentDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchAnalytics(),
                fetchRecentDocs()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thống kê");
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/admin/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error("Analytics error:", error);
        }
    };

    const fetchRecentDocs = async () => {
        try {
            const res = await api.get('/admin/documents', { params: { limit: 5 } });
            setRecentDocs(res.data || []);
        } catch (error) {
            console.error("Recent docs error:", error);
        }
    };

    const cards = [
        {
            label: 'Người dùng',
            value: stats.users,
            icon: Users,
            gradient: 'from-blue-600 to-cyan-500',
            shadow: 'shadow-blue-200 dark:shadow-blue-900/20'
        },
        {
            label: 'Hội thoại',
            value: stats.conversations,
            icon: Activity,
            gradient: 'from-emerald-600 to-teal-500',
            shadow: 'shadow-emerald-200 dark:shadow-emerald-900/20'
        },
        {
            label: 'Văn bản pháp lý',
            value: stats.documents,
            icon: FileText,
            gradient: 'from-purple-600 to-fuchsia-500',
            shadow: 'shadow-purple-200 dark:shadow-purple-900/20'
        },
        {
            label: 'Hệ thống',
            value: stats.system_health === 'online' ? 'Hoạt động' : stats.system_health,
            icon: Server,
            gradient: 'from-amber-500 to-orange-400',
            shadow: 'shadow-amber-200 dark:shadow-amber-900/20'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:p-10 p-6 pt-24 transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Premium Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <ShieldCheck size={14} />
                            Hệ thống Quản trị v1.2
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Quản lý hiệu năng và dữ liệu hệ thống LegalBot</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/admin/documents')}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Quản lý Văn bản
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 md:flex-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl transition-all font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center"
                        >
                            Trang chủ
                        </button>
                    </div>
                </div>

                {/* Glass Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => (
                        <div
                            key={idx}
                            className={`relative group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-[2rem] transition-all duration-300 hover:shadow-2xl ${card.shadow} hover:-translate-y-1`}
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {loading ? <span className="animate-pulse">...</span> : card.value}
                                    </h2>
                                </div>
                                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-[1.25rem] flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                                    <card.icon size={28} strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-[0.03] group-hover:opacity-[0.08] rounded-full transition-opacity`} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Topic Analysis - Left Side */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden h-full">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <Activity size={20} />
                                        </div>
                                        Phân tích Chủ đề
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Phân bố văn bản theo danh mục pháp lý</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật lúc</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date().toLocaleTimeString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {analytics.length === 0 && !loading ? (
                                    <div className="col-span-2 text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-slate-400 font-bold italic">Chưa có đủ dữ liệu phân tích</p>
                                    </div>
                                ) : (
                                    analytics.map((item, i) => (
                                        <div key={i} className="group cursor-default">
                                            <div className="flex justify-between items-end mb-3">
                                                <div>
                                                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{`Thành phần ${i + 1}`}</span>
                                                    <p className="font-black text-slate-800 dark:text-slate-100 leading-tight">{item.topic || "Khác"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{item.count}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Văn bản</span>
                                                </div>
                                            </div>
                                            <div className="relative h-4 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                                                    style={{ width: `${Math.min((item.count / (analytics[0]?.count || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Stack */}
                    <div className="space-y-8">

                        {/* System Health Card */}
                        <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                        <Database size={24} />
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Kết nối: Tốt</span>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black mb-3 tracking-tight">Hạ tầng AI</h3>
                                <p className="text-blue-100/80 text-sm font-medium leading-relaxed mb-8">
                                    Dữ liệu pháp luật đang được đồng bộ thời gian thực với Pinecone Vector DB và Supabase Cloud.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Độ trễ TB</p>
                                        <p className="text-xl font-black">240ms</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Uptime</p>
                                        <p className="text-xl font-black">99.9%</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32" />
                        </div>

                        {/* Recent Activity Card */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <Clock size={20} className="text-blue-500" />
                                    Văn bản mới nhất
                                </h3>
                                <button
                                    onClick={() => navigate('/admin/documents')}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-all group"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider">Xem tất cả</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recentDocs.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 italic text-sm">Chưa có dữ liệu</div>
                                ) : (
                                    recentDocs.map((doc, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                doc.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {doc.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[100px]">
                                                        {doc.category || "Hệ thống"}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400 italic">
                                                        {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
