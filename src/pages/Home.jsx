import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleClick = () => {
        console.log('Button clicked!'); // Debug log
        if (user) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                <h1 className="text-5xl font-bold text-slate-900">
                    LegalBot <span className="text-blue-600">AI</span>
                </h1>
                <p className="text-xl text-slate-600">
                    Trợ lý pháp luật thông minh của bạn
                </p>

                <button
                    onClick={handleClick}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-all text-lg cursor-pointer"
                    type="button"
                >
                    {user ? 'Bắt Đầu Chat' : 'Bắt Đầu Ngay'}
                </button>

                <div className="mt-8 text-sm text-slate-500">
                    <p>User status: {user ? 'Logged in' : 'Not logged in'}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
