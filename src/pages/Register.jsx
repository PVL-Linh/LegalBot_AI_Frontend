import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setBypassAuth } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            // Gọi backend API (có bypass mode khi Supabase rate limit)
            const response = await api.post('/auth/register', {
                email,
                password,
                full_name: fullName || email.split('@')[0],
            });

            console.log('Register response:', response.data);

            // Lưu user info và token qua Context
            if (response.data.user && response.data.access_token) {
                setBypassAuth(response.data.user, response.data.access_token);
                toast.success('Đăng ký thành công!');

                // Navigate to chat
                setTimeout(() => {
                    navigate('/chat');
                }, 500);
            }

        } catch (error) {
            console.error('Register error:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Đăng ký thất bại';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100 dark:border-slate-800 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Đăng Ký</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Tạo tài khoản mới</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên đầy đủ (tùy chọn)
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 ml-1 italic">Tối thiểu 6 ký tự</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Đăng Ký'
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                        Đăng nhập ngay
                    </Link>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-xl p-3 text-xs text-green-800 dark:text-green-300 text-center">
                    ✅ Hệ thống ổn định - Đăng ký ngay không giới hạn!
                </div>
            </div>
        </div>
    );
};

export default Register;
