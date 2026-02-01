import React, { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Menu, X, Settings, Trash2, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import api from '../lib/api';

const MainLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { id } = useParams();
    const { isDarkMode, toggleDarkMode } = useTheme();

    // Handler helpers
    const handleSelectChat = (chatId) => {
        navigate(`/chat/${chatId}`);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const handleNewChat = () => {
        navigate('/chat');
        setIsSidebarOpen(false); // Close sidebar on mobile after clicking new chat
    };

    const handleDeleteAll = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ lịch sử trò chuyện? Hành động này không thể hoàn tác.')) return;

        try {
            await api.delete('/conversations/clear');
            toast.success("Đã xóa toàn bộ lịch sử");
            setShowSettings(false);

            // Dispatch event for Sidebar to refresh
            window.dispatchEvent(new CustomEvent('refreshConversations'));

            // If we are on a chat page, navigate to home
            if (window.location.pathname.startsWith('/chat')) {
                navigate('/chat');
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa lịch sử");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            {/* Mobile Hamburger Toggle */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
                <Menu size={24} />
            </button>

            {/* Sidebar with mobile state */}
            <Sidebar
                currentChatId={id}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                openSettings={() => setShowSettings(true)}
            />

            {/* Mobile Overlay/Backdrop */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-slate-950">
                <Outlet />
            </div>

            {/* Modal Cài đặt (Globally centered) */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Settings size={20} className="text-blue-500" />
                                Cài đặt
                            </h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 transition-colors">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Chế độ tối</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Dark Mode</p>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 dark:ring-offset-slate-900 ${isDarkMode ? 'bg-blue-600 ring-blue-500/20' : 'bg-slate-200 ring-slate-100'}`}
                                >
                                    <span className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}>
                                        {isDarkMode ? <Moon size={10} className="m-0.5 text-blue-600" /> : <Sun size={10} className="m-0.5 text-orange-500" />}
                                    </span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-1">Vùng nguy hiểm</p>
                                <div className="p-4 border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5 rounded-2xl">
                                    <button
                                        onClick={handleDeleteAll}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Trash2 size={16} />
                                        Xóa tất cả hội thoại
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                Trợ lý Pháp Luật AI • v1.2.0
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
