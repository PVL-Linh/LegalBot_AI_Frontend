import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setBypassAuth } = useAuth();

  // Toggle test accounts buttons via Vite env variable `VITE_ENABLE_TEST_ACCOUNTS`.
  // Set `VITE_ENABLE_TEST_ACCOUNTS=1` to show Test User / Test Admin buttons in dev only.
  const ENABLE_TEST_ACCOUNTS =
    import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === "1" ||
    import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === "true";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      // Gọi backend API để login (hỗ trợ bypass mode)
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Lưu token và user info qua Context
      if (response.data.access_token) {
        setBypassAuth(response.data.user, response.data.access_token);
        toast.success("Đăng nhập thành công!");

        // Navigate to chat
        setTimeout(() => {
          navigate("/chat");
        }, 500);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.detail || error.message || "Đăng nhập thất bại";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (email, fullName) => {
    setLoading(true);
    try {
      const password = "password123";
      // Try to register first (ignore error if exists)
      try {
        await api.post("/auth/register", {
          email,
          password,
          full_name: fullName,
        });
      } catch (ignore) {}

      // Then Login
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.access_token) {
        setBypassAuth(response.data.user, response.data.access_token);
        toast.success(`Đăng nhập ${fullName} thành công!`);
        setTimeout(() => navigate("/chat"), 500);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi đăng nhập test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-900/20 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100 dark:border-slate-800 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Đăng Nhập
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Chào mừng trở lại!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500"
                size={18}
              />
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
              <Lock
                className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>

        {ENABLE_TEST_ACCOUNTS && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                handleTestLogin("user_fixed@test.com", "Test User")
              }
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 text-sm"
            >
              Test User
            </button>
            <button
              type="button"
              onClick={() =>
                handleTestLogin("admin_fixed@test.com", "Test Admin")
              }
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 py-3 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all border border-indigo-100 dark:border-indigo-800/30 text-sm"
            >
              Test Admin
            </button>
          </div>
        )}

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
          >
            Đăng ký ngay
          </Link>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 text-center">
          💡 Sử dụng email đã đăng ký để đăng nhập
        </div>
      </div>
    </div>
  );
};

export default Login;
