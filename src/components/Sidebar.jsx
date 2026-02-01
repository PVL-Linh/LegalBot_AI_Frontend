import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, LogOut, FileText, X, Edit2, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase'; // Using direct supabase for realtime/ease or use api
import api from '../lib/api';

const Sidebar = ({ currentChatId, onSelectChat, onNewChat, isOpen, setIsOpen, openSettings }) => {
    const [conversations, setConversations] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editBuffer, setEditBuffer] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchConversations();
        }

        const handleRefresh = () => {
            if (user) fetchConversations();
        };

        // Listen for internal refresh requests (e.g. from Chat after new convo)
        window.addEventListener('refreshConversations', handleRefresh);
        return () => window.removeEventListener('refreshConversations', handleRefresh);
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;
        console.log('Sidebar: Fetching conversations...');
        try {
            // Use Backend API to fetch conversations (bypasses RLS issues for test users)
            const res = await api.get('/conversations');
            console.log(`Sidebar: Received ${res.data?.length || 0} conversations:`, res.data);
            setConversations(res.data || []);
        } catch (error) {
            console.error('Sidebar: Error fetching conversations:', error);
            // Fallback mock only if API fails and user is 'test' (legacy)
            if (user?.id === 'test') {
                setConversations([
                    { id: 'mock-1', title: 'Hỏi về luật lao động', updated_at: new Date().toISOString() },
                ]);
            }
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc muốn xóa đoạn chat này?')) return;
        try {
            await api.delete(`/conversations/${id}`);
            setConversations(conversations.filter(c => c.id !== id));
            if (currentChatId === id) onNewChat();
            toast.success("Đã xóa");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi xóa chat");
        }
    };

    const handleDeleteAll = async () => {
        // Redundant - Logic moved to MainLayout
    };

    const handleStartEdit = (e, conv) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditBuffer(conv.title || 'Đoạn chat mới');
    };

    const handleSaveTitle = async (e, id) => {
        e?.stopPropagation();
        if (!editBuffer.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await api.patch(`/conversations/${id}`, { title: editBuffer });
            setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editBuffer } : c));
            setEditingId(null);
            // Sync with Chat page if it's currently open
            window.dispatchEvent(new CustomEvent('refreshChatHistory'));
            toast.success("Đã cập nhật tiêu đề");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật tiêu đề");
        }
    };

    return (
        <div className={`
            fixed lg:relative z-50 lg:z-auto h-full
            w-72 lg:w-64 bg-white dark:bg-slate-950 flex flex-col border-r border-slate-200 dark:border-slate-800 
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            {/* Mobile Header with Close Button */}
            <div className="lg:hidden p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Menu</span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 space-y-2">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Chat Mới
                </button>

                {user?.role === 'admin' && (
                    <>
                        <div className="pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hệ thống</div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center justify-start gap-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 p-2.5 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                            <FileText size={18} />
                            Dashboard
                        </button>
                    </>
                )}

                <button
                    onClick={() => navigate('/documents/create')}
                    className="w-full flex items-center justify-start gap-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 p-2.5 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                    <Plus size={18} />
                    Tạo Văn Bản
                </button>

                {/* Search Bar */}
                <div className="relative mt-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm lịch sử chat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border-none rounded-xl text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="pt-2 pb-1 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gần đây</div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                {conversations
                    .filter(conv => conv.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectChat(conv.id)}
                            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentChatId === conv.id
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800'
                                : 'text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-300'
                                }`}
                        >
                            <MessageSquare size={18} className={currentChatId === conv.id ? 'text-blue-600 dark:text-blue-400' : ''} />

                            {editingId === conv.id ? (
                                <input
                                    autoFocus
                                    value={editBuffer}
                                    onChange={(e) => setEditBuffer(e.target.value)}
                                    onBlur={() => handleSaveTitle(null, conv.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(e, conv.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-sm font-medium rounded px-1 outline-none ring-1 ring-blue-500"
                                />
                            ) : (
                                <>
                                    <span className="truncate text-sm font-medium flex-1">{conv.title || 'Đoạn chat mới'}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleStartEdit(e, conv)}
                                            className="p-1 hover:text-blue-600 dark:hover:text-blue-400"
                                            title="Sửa tiêu đề"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, conv.id)}
                                            className="p-1 hover:text-red-500"
                                            title="Xóa chat"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 uppercase font-bold text-xs ring-2 ring-white dark:ring-slate-900">
                        {user?.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={openSettings}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="Cài đặt"
                    >
                        <Settings size={18} />
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 p-2.5 rounded-xl transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Đăng Xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
