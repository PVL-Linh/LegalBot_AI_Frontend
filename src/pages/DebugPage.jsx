import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const DebugPage = () => {
    const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1');
    const [testResult, setTestResult] = useState(null);
    const navigate = useNavigate();

    const [tokenStatus, setTokenStatus] = useState('Unknown');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setTokenStatus(`Present (starts with: ${token.substring(0, 5)}..., len: ${token.length})`);
        } else {
            setTokenStatus('Missing');
        }
    }, []);

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-4xl font-bold mb-8">Debug Page</h1>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">LocalStorage Status</p>
                <p className="text-lg font-mono text-slate-800">Token: <span className={tokenStatus === 'Missing' ? 'text-red-600' : 'text-green-600'}>{tokenStatus}</span></p>
            </div>
            <div className="space-y-6">
                <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200">
                    <h2 className="font-bold text-slate-800 mb-2">Navigation</h2>
                    <button
                        onClick={() => navigate('/chat')}
                        className="bg-white text-slate-800 border border-slate-300 px-6 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
                    >
                        Return to Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugPage;
