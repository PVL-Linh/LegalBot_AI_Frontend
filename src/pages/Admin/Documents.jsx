import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, ChevronLeft } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/admin/documents');
            setDocuments(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách văn bản");
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Chỉ hỗ trợ file PDF");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace('.pdf', '')); // Backend requires title

        setUploading(true);
        try {
            await api.post('/admin/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Upload thành công! Đang xử lý...");
            fetchDocuments();
        } catch (error) {
            console.error(error);
            toast.error("Upload thất bại - Kiểm tra Log Server");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Chắc chắn xóa document này?")) return;
        try {
            await api.delete(`/admin/documents/${id}`);
            setDocuments(documents.filter(d => d.id !== id));
            toast.success("Đã xóa");
        } catch (error) {
            toast.error("Lỗi xóa");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:p-8 p-6 pt-20 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quản Lý Văn Bản</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tải lên và quản lý cơ sở tri thức pháp luật</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText size={20} className="text-blue-500" />
                            Danh sách văn bản
                        </h2>
                        <label className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]">
                            {uploading ? (
                                <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> Đang tải...</>
                            ) : (
                                <><Upload size={18} /> Tải PDF Mới</>
                            )}
                            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
                        </label>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tên file</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 animate-fade-in">
                                            <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                                                <FileText size={48} className="opacity-20" />
                                                <p className="font-medium">Chưa có văn bản nào được hệ thống lưu trữ</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">#{doc.id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                                        <FileText size={16} />
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={doc.title}>
                                                        {doc.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                        doc.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                                                            'bg-red-100 dark:bg-red-900/30 text-red-600'
                                                    }`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Xóa văn bản"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDocuments;
