import React, { useState, useEffect, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Bot, Loader2, Paperclip, Copy, RefreshCcw, Check, ArrowRight, Trash2, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useTheme } from '../context/ThemeContext';

// Utility rút gọn tên file ở giữa
const truncateFilename = (name, maxLength = 24) => {
    if (!name || name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const charsToShow = Math.max(maxLength - extension.length - 4, 4);
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return nameWithoutExt.substr(0, frontChars) + '...' + nameWithoutExt.substr(nameWithoutExt.length - backChars) + '.' + extension;
};

// Thành phần hiển thị tệp đính kèm tối giản
const FileAttachment = ({ content }) => {
    const filenameMatch = content.match(/Filename:\s*(.*)/);
    const filename = filenameMatch ? filenameMatch[1].trim() : "Tài liệu";
    const displayFilename = truncateFilename(filename);

    return (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 my-2 max-w-sm animate-fade-in shadow-sm flex items-center gap-3">
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-red-600 dark:text-red-400">
                <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" title={filename}>{displayFilename}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tài liệu PDF</div>
            </div>
        </div>
    );
};

// Memoized Message Item for Performance
const MessageItem = memo(({ msg, idx, isLast, streaming, status, parseSuggestions, handleCopy, handleSend, handleDeleteMessage, copiedId, setInput }) => {
    const { text, suggestions } = parseSuggestions(msg.content);

    return (
        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isLast ? '' : 'animate-slide-up'} group relative mb-10`}>
            {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                    <Bot size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
            )}

            <div className={`flex flex-col ${msg.role === 'user' ? 'max-w-[85%] items-end' : 'max-w-[90%] items-start'} relative group`}>
                <div className={`leading-relaxed relative transition-all duration-300 ${msg.role === 'user'
                    ? 'bg-slate-100 dark:bg-blue-600 text-slate-800 dark:text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm border border-slate-200 dark:border-transparent text-sm'
                    : 'w-full text-slate-800 dark:text-slate-200 pr-4'
                    }`}>
                    {msg.role === 'user' ? (
                        text
                    ) : (
                        msg.content && msg.content.includes('[PDF_ATTACHMENT]') ? (
                            <FileAttachment content={msg.content} />
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none 
                                prose-h3:text-slate-800 dark:prose-h3:text-slate-100 prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-h3:border-l-4 prose-h3:border-blue-600 prose-h3:pl-3
                                prose-ul:list-none prose-ul:p-0 prose-li:relative prose-li:pl-6 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:w-1.5 prose-li:before:h-1.5 prose-li:before:bg-blue-500 prose-li:before:rounded-full
                                prose-strong:text-blue-700 dark:prose-strong:text-blue-400 prose-strong:font-semibold
                                prose-blockquote:border-l-4 prose-blockquote:border-emerald-400 prose-blockquote:bg-emerald-50/50 dark:prose-blockquote:bg-emerald-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:rounded-r-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                                {streaming && isLast && (
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 dark:bg-blue-400 animate-pulse align-middle"></span>
                                )}
                            </div>
                        )
                    )}

                    {/* Action Toolbar */}
                    {!streaming && (
                        <div className={`absolute -top-8 ${msg.role === 'user' ? 'right-0' : 'left-0'} flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-10`}>
                            <button onClick={() => handleCopy(text, msg.id || idx)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors" title="Sao chép">
                                {copiedId === (msg.id || idx) ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                            {msg.role === 'assistant' && (
                                <button onClick={() => { setInput(msg.content || ''); handleSend({ preventDefault: () => { } }); }} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors" title="Thử lại">
                                    <RefreshCcw size={14} />
                                </button>
                            )}
                            {msg.id && (
                                <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500 transition-colors" title="Xóa">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Thinking indicator */}
                {streaming && isLast && msg.role === 'assistant' && !text && (
                    <div className="w-full space-y-3 mt-4 animate-pulse-gentle pr-20">
                        <div className="shimmer-container dark:bg-slate-800 h-4 w-full"><div className="shimmer-bar"></div></div>
                        <div className="shimmer-container dark:bg-slate-800 h-4 w-2/3"><div className="shimmer-bar"></div></div>
                    </div>
                )}

                {/* Suggestions */}
                {isLast && !streaming && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                        {suggestions.map((suggestion, sIdx) => (
                            <button key={sIdx}
                                onClick={() => { setInput(suggestion); setTimeout(() => handleSend({ preventDefault: () => { } }), 50); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all hover:scale-105 active:scale-95 shadow-sm">
                                {suggestion} <ArrowRight size={12} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

const Chat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const [input, setInput] = useState('');
    const [currentChatId, setCurrentChatId] = useState(id);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const streamingRef = useRef(false);
    const [status, setStatus] = useState('');
    const [title, setTitle] = useState('Luật Sư Trợ Lý AI');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleBuffer, setEditTitleBuffer] = useState('');
    const fileInputRef = useRef(null);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const preventFetchRef = useRef(false);

    // Throttling Logic for smooth text release
    const tokenBufferRef = useRef('');
    const typingIntervalRef = useRef(null);

    // Sync currentChatId with URL id changes (e.g. from sidebar navigation)
    useEffect(() => {
        if (id !== currentChatId) {
            setCurrentChatId(id);
        }
    }, [id]);

    // ==========================================
    // File Upload Logic
    // ==========================================
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const pdfFiles = files.filter(f => f.type === 'application/pdf');
        if (pdfFiles.length < files.length) {
            toast.error("Chỉ hỗ trợ tệp PDF");
        }

        setPendingFiles(prev => {
            const newList = [...prev, ...pdfFiles];
            if (newList.length > 5) {
                toast.warning("Chỉ cho phép đính kèm tối đa 5 tệp");
                return newList.slice(0, 5);
            }
            return newList;
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePendingFile = (index) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ==========================================
    // History & WebSocket Logic
    // ==========================================

    const fetchHistory = async (chatId) => {
        if (streamingRef.current) {
            console.log("Skipping history sync during active stream");
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/history/${chatId}`);
            if (res.data?.conversation) {
                const convTitle = res.data.conversation.title || 'Đoạn chat mới';
                setTitle(convTitle);
                setEditTitleBuffer(convTitle);
            }
            if (res.data?.messages) {
                const history = res.data.messages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: m.created_at
                }));
                setMessages(history);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không tải được lịch sử chat");
        } finally {
            setLoading(false);
        }
    };

    const parseSuggestions = (content) => {
        if (!content) return { text: '', suggestions: [] };

        // Patterns to match suggestions block: from strict to lenient
        const patterns = [
            /\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/i,
            /<SUGGESTIONS>([\s\S]*?)<\/SUGGESTIONS>/i,
            /\[SUGGESTIONS\]([\s\S]*?)$/i,  // Unclosed tag
            /<SUGGESTIONS>([\s\S]*?)$/i      // Unclosed tag
        ];

        let suggestions = [];
        let cleanText = content;

        for (const regex of patterns) {
            const match = content.match(regex);
            if (match) {
                const raw = match[1];
                const parts = raw
                    .split(/\n|(?=-\s)|(?=\d\.\s)/)
                    .map(s => s.trim().replace(/^[-\d.]\s*/, ''))
                    .filter(s => s.length >= 2 && s.length < 150);

                if (parts.length > 0) {
                    suggestions = parts.slice(0, 4);
                    cleanText = content.replace(regex, '').trim();
                    break;
                }
            }
        }

        cleanText = cleanText.replace(/\[\/?SUGGESTIONS\]/gi, '').replace(/<\/?SUGGESTIONS>/gi, '').trim();
        return { text: cleanText, suggestions };
    };

    const startTypingEffect = () => {
        if (typingIntervalRef.current) return;

        typingIntervalRef.current = setInterval(() => {
            if (tokenBufferRef.current.length > 0) {
                // Tự động điều chỉnh tốc độ: Nếu xóa quá nhiều (người dùng quay lại từ tab khác), 
                // thì xả nhanh hơn để đuổi kịp.
                let releaseCount = 2; // Mặc định
                if (tokenBufferRef.current.length > 200) releaseCount = 50;  // Rất xa (vừa quay lại tab)
                else if (tokenBufferRef.current.length > 50) releaseCount = 15; // Hơi xa
                else if (tokenBufferRef.current.length > 20) releaseCount = 5;  // Bình thường

                const chunk = tokenBufferRef.current.substring(0, releaseCount);
                tokenBufferRef.current = tokenBufferRef.current.substring(releaseCount);

                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastIdx = newMsgs.length - 1;
                    if (lastIdx >= 0 && newMsgs[lastIdx].role === 'assistant') {
                        newMsgs[lastIdx] = {
                            ...newMsgs[lastIdx],
                            content: newMsgs[lastIdx].content + chunk
                        };
                    }
                    return newMsgs;
                });
            } else if (!streamingRef.current) {
                // Buffer empty AND stream ended
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }
        }, 15);
    };

    const connectWebSocket = (messageContent) => {
        const currentInput = messageContent || input;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBase = apiUrl.replace(/^http(s)?:\/\//, '');
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast.error('Vui lòng đăng nhập lại');
            return;
        }
        const wsUrl = `${wsProtocol}://${wsBase}/ws/chat?token=${encodeURIComponent(token)}${currentChatId ? `&conversation_id=${currentChatId}` : ''}`;

        if (ws.current) {
            ws.current.close();
        }
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            ws.current.send(currentInput);
            setStatus("Đang suy nghĩ...");
            setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
            setInput('');
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'start') {
                    setStreaming(true);
                    streamingRef.current = true;
                    tokenBufferRef.current = '';
                    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
                    startTypingEffect();

                } else if (data.type === 'token') {
                    setStatus('');
                    tokenBufferRef.current += data.content;
                    // Typing effect is already running from 'start'

                } else if (data.type === 'status') {
                    setStatus(data.content);
                } else if (data.type === 'meta') {
                    if (!currentChatId) {
                        preventFetchRef.current = true;
                        setCurrentChatId(data.conversation_id);
                        navigate(`/chat/${data.conversation_id}`, { replace: true });
                        window.dispatchEvent(new CustomEvent('refreshConversations'));
                    }
                } else if (data.type === 'error') {
                    toast.error(data.content);
                    setStreaming(false);
                    streamingRef.current = false;
                    setStatus('');
                } else if (data.type === 'end') {
                    setStreaming(false);
                    streamingRef.current = false;
                    setStatus('');
                    const finalId = currentChatId || data.conversation_id;
                    if (finalId) {
                        setTimeout(() => fetchHistory(finalId), 1500);
                    }
                }
            } catch (err) {
                console.error("WS Parse Error:", err);
            }
        };

        ws.current.onerror = (e) => {
            console.error("WS Error:", e);
            toast.error("Lỗi kết nối");
            setStreaming(false);
            streamingRef.current = false;
            setStatus('');
        };
    };

    // ==========================================
    // Lifecycle Hooks
    // ==========================================

    useEffect(() => {
        if (currentChatId) {
            if (preventFetchRef.current) {
                preventFetchRef.current = false;
                return;
            }
            fetchHistory(currentChatId);
        } else {
            setMessages([]);
            setTitle('Luật Sư Trợ Lý AI');
            setEditTitleBuffer('Luật Sư Trợ Lý AI');
        }
    }, [currentChatId]);

    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, status]);

    // ==========================================
    // UI Handlers
    // ==========================================

    const handleSend = async (e) => {
        e.preventDefault();
        const textToSearch = input.trim();
        if (!textToSearch && pendingFiles.length === 0) return;
        if (streaming) return;

        let finalInput = textToSearch || "(Gửi tài liệu)";

        if (pendingFiles.length > 0) {
            if (!id) {
                toast.warning("Vui lòng bắt đầu cuộc trò chuyện trước khi đính kèm tài liệu");
                return;
            }
            setStatus(`Đang tải ${pendingFiles.length} tài liệu...`);
            try {
                await Promise.all(pendingFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return api.post(`/chat/upload/${id}?silent=true`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }));
                setPendingFiles([]);
            } catch (err) {
                console.error("Upload error:", err);
                toast.error("Không thể tải lên tài liệu đính kèm");
                setStatus("");
                return;
            }
        }
        connectWebSocket(finalInput);
    };

    const handleUpdateTitle = async () => {
        if (!id || !editTitleBuffer.trim() || editTitleBuffer === title) {
            setIsEditingTitle(false);
            return;
        }
        try {
            await api.patch(`/conversations/${id}`, { title: editTitleBuffer });
            setTitle(editTitleBuffer);
            setIsEditingTitle(false);
            window.dispatchEvent(new CustomEvent('refreshConversations'));
            toast.success("Đã đổi tên");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi đổi tên");
        }
    };

    const handleCopy = (text, msgId) => {
        navigator.clipboard.writeText(text);
        setCopiedId(msgId);
        toast.success("Đã sao chép");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDeleteMessage = async (msgId) => {
        if (!confirm("Xóa tin nhắn này?")) return;
        try {
            await api.delete(`/messages/${msgId}`);
            setMessages(messages.filter(m => m.id !== msgId));
            toast.success("Đã xóa");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi xóa");
        }
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-950 flex-1 overflow-hidden transition-colors duration-300">
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative">
                {/* Header */}
                <div className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center lg:px-6 pl-16 pr-6 justify-between z-20 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none mr-[5px]">
                            <Bot size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    value={editTitleBuffer}
                                    onChange={(e) => setEditTitleBuffer(e.target.value)}
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                    className="bg-slate-100 dark:bg-slate-800 border-none outline-none rounded px-2 py-1 w-full text-base font-bold text-slate-800 dark:text-slate-100 ring-2 ring-blue-500"
                                />
                            ) : (
                                <h1
                                    onClick={() => id && setIsEditingTitle(true)}
                                    className={`font-bold text-slate-800 dark:text-slate-100 text-base leading-tight truncate ${id ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                                    title={id ? 'Click để đổi tên' : ''}
                                >
                                    {title}
                                </h1>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${streaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                                {streaming ? (status || 'Đang phân tích') : 'Sẵn sàng'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pt-8 pb-40 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {messages.length === 0 && !loading && (
                            <div className="text-center py-20 animate-fade-in">
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 rotate-12">
                                    <Bot size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Xin chào! Tôi là trợ lý pháp luật</h2>
                                <p className="text-slate-500 dark:text-slate-400">Tôi có thể giúp gì cho bạn hôm nay?</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <MessageItem
                                key={msg.id || idx}
                                msg={msg}
                                idx={idx}
                                isLast={idx === messages.length - 1}
                                streaming={streaming || tokenBufferRef.current.length > 0}
                                status={status}
                                parseSuggestions={parseSuggestions}
                                handleCopy={handleCopy}
                                handleSend={handleSend}
                                handleDeleteMessage={handleDeleteMessage}
                                copiedId={copiedId}
                                setInput={setInput}
                            />
                        ))}

                        {status && (
                            <div className="flex justify-start animate-fade-in mb-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>{status}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-32" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent pointer-events-none z-10">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        {pendingFiles.length > 0 && (
                            <div className="mb-3 animate-slide-up flex flex-wrap gap-2 items-start max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {pendingFiles.map((file, idx) => (
                                    <div key={idx} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-center gap-2 shadow-md max-w-[240px] group">
                                        <div className="bg-red-50 dark:bg-red-900/30 p-1.5 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0"><FileText size={14} /></div>
                                        <div className="flex-1 min-w-0 pr-1"><div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate" title={file.name}>{truncateFilename(file.name, 20)}</div></div>
                                        <button type="button" onClick={() => removePendingFile(idx)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" title="Gỡ bỏ"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative group">
                            <form onSubmit={handleSend} className="bg-slate-50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-2 flex items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-400/5 focus-within:border-blue-200 dark:focus-within:border-blue-800">
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" multiple className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block" title="Tải lên tài liệu PDF (Tối đa 5)"><Paperclip size={20} /></button>

                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={pendingFiles.length > 0 ? "Đặt câu hỏi về các tài liệu này..." : "Đặt câu hỏi pháp lý chi tiết..."} className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 border-0 focus:ring-0 px-4 py-3 text-base" disabled={streaming} />

                                <button type="submit" disabled={(!input.trim() && pendingFiles.length === 0) || streaming} className={`p-3 rounded-2xl transition-all shadow-lg ${(!input.trim() && pendingFiles.length === 0) || streaming ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600' : 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:scale-105 active:scale-95'}`}>
                                    {streaming ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                                </button>
                            </form>
                        </div>
                        <p className="text-center mt-3 text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest">Trợ lý AI tuân thủ quy định pháp luật Việt Nam</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
