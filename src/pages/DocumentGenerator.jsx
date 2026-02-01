import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, Loader2, ArrowLeft, History, FilePlus, ShieldCheck, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';

const DocumentGenerator = () => {
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState('don_khieu_nai_sa_thai');
    const [loading, setLoading] = useState(false);
    const [isRefining, setIsRefining] = useState({}); // Track field-specific AI state
    const [previewContent, setPreviewContent] = useState('');

    const templates = [
        { id: 'don_khieu_nai_sa_thai', name: 'Đơn Khiếu Nại Sa Thải', icon: <FileText size={18} /> },
        { id: 'don_ly_hon_thuan_tinh', name: 'Đơn Ly Hôn Thuận Tình', icon: <History size={18} /> },
        { id: 'don_khoi_kien', name: 'Đơn Khởi Kiện Dân Sự', icon: <ShieldCheck size={18} /> },
        { id: 'hop_dong_dat_coc', name: 'Hợp Đồng Đặt Cọc', icon: <FilePlus size={18} /> },
        { id: 'giay_uy_quyen', name: 'Giấy Ủy Quyền', icon: <HelpCircle size={18} /> },
        { id: 'hop_dong_thue_nha', name: 'Hợp Đồng Thuê Nhà Ở', icon: <FileText size={18} /> },
    ];

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        recipient: '',
        reason: '',
        content: '',
        request: ''
    });

    // Scaling Logic for A4 Preview
    const previewContainerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const VIRTUAL_A4_WIDTH = 794; // approx 210mm @ 96dpi

    useEffect(() => {
        if (!previewContainerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                const newScale = Math.min(1, (containerWidth - 40) / VIRTUAL_A4_WIDTH);
                setScale(newScale);
            }
        });

        resizeObserver.observe(previewContainerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-fill sample data when template changes
    useEffect(() => {
        const samples = {
            don_khieu_nai_sa_thai: {
                reason: 'Sa thải trái quy định pháp luật',
                content: 'Tôi đã làm việc tại công ty từ ngày... đến ngày... Công ty đã đơn phương chấm dứt hợp đồng lao động mà không có lý do chính đáng và không tuân thủ thời hạn báo trước...',
                request: 'Yêu cầu công ty nhận lại làm việc, bồi thường tiền lương và các khoản bảo hiểm trong những ngày không được làm việc.'
            },
            don_ly_hon_thuan_tinh: {
                reason: 'Mâu thuẫn kéo dài, không thể hàn gắn',
                content: 'Vợ chồng chúng tôi chung sống từ năm... trên cơ sở tự nguyện. Tuy nhiên thời gian qua nảy sinh nhiều mâu thuẫn về quan điểm sống, mục đích hôn nhân không đạt được...',
                request: 'Đề nghị Tòa án công nhận thuận tình ly hôn, thỏa thuận về quyền nuôi con và phân chia tài sản chung.'
            },
            don_khoi_kien: {
                recipient: 'Tòa án nhân dân Quận/Huyện...',
                reason: 'Tranh chấp hợp đồng vay tài sản',
                content: 'Ngày ... tháng ... năm ..., ông/bà ... có vay của tôi số tiền là ... VNĐ. Đến hạn thanh toán nhưng ông/bà này cố tình trốn tránh không trả...',
                request: 'Yêu cầu Tòa án buộc ông/bà ... phải trả cho tôi số tiền gốc và lãi suất theo quy định.'
            },
            hop_dong_dat_coc: {
                recipient: 'Nguyễn Văn B (Bên nhận)',
                reason: 'Đặt cọc mua bán quyền sử dụng đất',
                content: 'Bên A đồng ý đặt cọc cho bên B để bảo đảm thực hiện hợp đồng chuyển nhượng quyền sử dụng đất tại thửa đất số ..., tờ bản đồ số ...',
                request: 'Số tiền đặt cọc là 100.000.000 VNĐ. Thời hạn ký hợp đồng chính thức là 30 ngày kể từ ngày đặt cọc.'
            },
            giay_uy_quyen: {
                recipient: 'Trần Thị C',
                reason: 'Ủy quyền thực hiện thủ tục hành chính',
                content: 'Người được ủy quyền thay mặt tôi thực hiện các thủ tục liên quan đến việc cấp đổi giấy phép lái xe tại cơ quan có thẩm quyền...',
                request: 'Thời hạn ủy quyền là 03 tháng kể từ ngày ký.'
            },
            hop_dong_thue_nha: {
                recipient: 'Lê Văn D (Chủ nhà)',
                reason: 'Thuê nhà để ở lâu dài',
                content: 'Bên A cho Bên B thuê căn hộ chung cư tại địa chỉ ... với đầy đủ trang thiết bị nội thất đi kèm...',
                request: 'Thời hạn thuê 02 năm. Giá thuê 10.000.000 VNĐ/tháng. Đặt cọc 02 tháng tiền thuê.'
            }
        };

        if (samples[selectedTemplate]) {
            setFormData(prev => ({
                ...prev,
                ...samples[selectedTemplate]
            }));
        }
    }, [selectedTemplate]);

    const fetchPreview = async (currentData) => {
        setLoading(true);
        try {
            const response = await api.post('/generator/preview', {
                doc_type: selectedTemplate,
                data: currentData
            });
            setPreviewContent(response.data.preview);
            toast.info("Đã cập nhật bản xem trước");
        } catch (error) {
            console.error("Preview error:", error);
            toast.error("Lỗi tạo bản xem trước");
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => fetchPreview(formData);

    const handleAIRefine = async (fieldName) => {
        const content = formData[fieldName];
        if (!content || content.trim().length < 5) {
            toast.warning('Vui lòng nhập thêm nội dung để AI có thể cải thiện.');
            return;
        }

        setIsRefining(prev => ({ ...prev, [fieldName]: true }));
        try {
            const response = await api.post('/generator/ai-refine', {
                field_name: fieldName === 'reason' ? 'Lý do/Sự việc' : (fieldName === 'content' ? 'Nội dung chi tiết' : 'Yêu cầu'),
                content: content,
                doc_type: selectedTemplate
            });

            if (response.data.refined_text) {
                const updatedData = {
                    ...formData,
                    [fieldName]: response.data.refined_text
                };

                setFormData(updatedData);
                toast.success(`Đã cải thiện nội dung thành công!`);

                // Automatically refresh preview with the updated data
                await fetchPreview(updatedData);
            }
        } catch (err) {
            console.error('AI Refinement failed:', err);
            toast.error('Không thể cải thiện nội dung vào lúc này.');
        } finally {
            setIsRefining(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await api.post('/generator/download', {
                doc_type: selectedTemplate,
                data: formData
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedTemplate}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Tải xuống thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải xuống văn bản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:px-6 pl-16 pr-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            Tạo Văn Bản Pháp Lý
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drafting Professional Legal Documents</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        <span className="hidden sm:inline">Tải Về (.docx)</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-65px)]">

                {/* Left Column: Input Form (Scrollable) */}
                <div className="w-full lg:w-1/2 overflow-y-auto p-6 lg:p-10 border-r border-slate-200 dark:border-slate-800 custom-scrollbar">
                    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">1</div>
                                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Cấu hình văn bản</h2>
                            </div>

                            <div className="space-y-5">
                                <div className="glass-card dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Chọn Mẫu Văn Bản</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setSelectedTemplate(t.id)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${selectedTemplate === t.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
                                                    }`}
                                            >
                                                {t.icon}
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="animate-slide-up">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">2</div>
                                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Thông tin chi tiết</h2>
                            </div>

                            <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Họ và Tên</label>
                                        <input
                                            type="text" name="full_name"
                                            value={formData.full_name} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Địa Chỉ</label>
                                        <input
                                            type="text" name="address"
                                            value={formData.address} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Hố Chí Minh..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Kính gửi / Đối tượng</label>
                                    <input
                                        type="text" name="recipient"
                                        value={formData.recipient} onChange={handleInputChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Tòa án / Công ty / Đối tác..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Lý do / Tiêu đề</label>
                                    <div className="relative group/ai">
                                        <input
                                            type="text" name="reason"
                                            value={formData.reason} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                            placeholder="Tóm tắt vấn đề..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAIRefine('reason')}
                                            disabled={isRefining['reason']}
                                            className="absolute top-2 right-2 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-all opacity-0 group-hover/ai:opacity-100 disabled:opacity-50"
                                            title="Cải thiện bằng AI"
                                        >
                                            {isRefining['reason'] ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nội dung chi tiết</label>
                                    <div className="relative group/ai">
                                        <textarea
                                            name="content" rows={6}
                                            value={formData.content} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none pr-12"
                                            placeholder="Trình bày chi tiết các sự kiện pháp lý..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAIRefine('content')}
                                            disabled={isRefining['content']}
                                            className="absolute top-3 right-3 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-all opacity-0 group-hover/ai:opacity-100 disabled:opacity-50"
                                            title="Cải thiện bằng AI"
                                        >
                                            {isRefining['content'] ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Kiến nghị / Yêu cầu</label>
                                    <div className="relative group/ai">
                                        <textarea
                                            name="request" rows={3}
                                            value={formData.request} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none pr-12"
                                            placeholder="Yêu cầu cụ thể bạn muốn đạt được..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAIRefine('request')}
                                            disabled={isRefining['request']}
                                            className="absolute top-3 right-3 p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 transition-all opacity-0 group-hover/ai:opacity-100 disabled:opacity-50"
                                            title="Cải thiện bằng AI"
                                        >
                                            {isRefining['request'] ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePreview}
                                    disabled={loading}
                                    className="w-full bg-slate-800 dark:bg-blue-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Eye size={20} />}
                                    Xem Trước Bản Thảo
                                </button>
                            </div>
                        </section>

                        <div className="h-10" />
                    </div>
                </div>

                {/* Right Column: Live Preview (Paper Style) */}
                <div ref={previewContainerRef} className="w-full lg:w-1/2 bg-slate-200 dark:bg-slate-900/50 p-4 lg:p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
                    <div className="flex flex-col gap-6 w-full max-w-[210mm] animate-scale-up">
                        <div className="p-4 mb-4 flex justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-xl border border-white dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">A4 Proportional Preview</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-serif italic">Scale: {Math.round(scale * 100)}% • Proportionate Scaling</span>
                        </div>

                        {/* Scaling Paper Wrapper */}
                        <div className="relative w-full overflow-hidden flex justify-center" style={{ height: `${1123 * scale}px` }}>
                            <div className="bg-white shadow-2xl relative overflow-hidden transition-all duration-300 antialiased"
                                style={{
                                    width: `${VIRTUAL_A4_WIDTH}px`,
                                    height: '1123px',
                                    padding: '60px 80px',
                                    fontFamily: "'Roboto Serif', serif",
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top center',
                                    position: 'absolute'
                                }}>
                                {/* Paper watermark effect */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none"
                                    style={{ backgroundImage: 'radial-gradient(#001b3e 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                                {previewContent ? (
                                    <div className="relative z-10 text-[16px] text-justify animate-fade-in flex flex-col gap-1 tracking-normal text-slate-900 leading-[1.6]">
                                        {previewContent.split('\n').map((line, index) => {
                                            const trimmedLine = line.trim();

                                            // Styling for National Header (Quốc hiệu)
                                            if (trimmedLine === "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM") {
                                                return (
                                                    <div key={index} className="text-center font-bold text-[14.5px] uppercase mb-0 tracking-tight leading-loose">
                                                        {line}
                                                    </div>
                                                );
                                            }

                                            if (trimmedLine === "Độc lập - Tự do - Hạnh phúc") {
                                                return (
                                                    <div key={index} className="flex flex-col items-center mb-10">
                                                        <div className="text-center font-bold text-[16px] leading-none mb-2">
                                                            {line}
                                                        </div>
                                                        <div className="w-48 border-b-2 border-slate-900"></div>
                                                    </div>
                                                );
                                            }

                                            if (trimmedLine === "---------------") return null;

                                            // Styling for Main Titles (Uppercase and Bold)
                                            if (trimmedLine.length > 5 && trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.includes(':') && !trimmedLine.includes('CMND')) {
                                                return (
                                                    <div key={index} className="text-center font-bold text-[20px] py-10 uppercase tracking-wide leading-tight">
                                                        {line}
                                                    </div>
                                                );
                                            }

                                            // Styling for Section Labels (Bold)
                                            const isSectionLabel = trimmedLine.endsWith(':') ||
                                                trimmedLine.startsWith('NGƯỜI') ||
                                                trimmedLine.startsWith('BÊN') ||
                                                trimmedLine.startsWith('Kính gửi') ||
                                                trimmedLine.startsWith('Vợ:') ||
                                                trimmedLine.startsWith('Chồng:');

                                            if (isSectionLabel) {
                                                return (
                                                    <div key={index} className="font-bold mt-4 mb-1">
                                                        {line}
                                                    </div>
                                                );
                                            }

                                            // Signature Area Handling
                                            if (trimmedLine.includes('BÊN A') && trimmedLine.includes('BÊN B')) {
                                                const parts = trimmedLine.split(/\s{2,}/);
                                                return (
                                                    <div key={index} className="grid grid-cols-2 mt-16 font-bold italic">
                                                        <div className="text-center">{parts[0]}</div>
                                                        <div className="text-center">{parts[1] || ''}</div>
                                                    </div>
                                                );
                                            }

                                            // Enhanced Signature Area Detection
                                            const isSignatureLine = trimmedLine.includes('Người làm đơn') ||
                                                trimmedLine.includes('Người cam đoan') ||
                                                trimmedLine.includes('Người khai') ||
                                                trimmedLine.includes('Người ủy quyền') ||
                                                trimmedLine.includes('Người thụ hưởng') ||
                                                (trimmedLine.includes('ngày') && trimmedLine.includes('tháng') && trimmedLine.includes('năm')) ||
                                                trimmedLine.includes('(Ký') ||
                                                trimmedLine.includes('(Ký và ghi rõ họ tên)');

                                            if (isSignatureLine) {
                                                return (
                                                    <div key={index} className="w-full flex justify-end">
                                                        <div className="flex flex-col items-center min-w-[280px] mt-2 first:mt-10">
                                                            <div className={(trimmedLine.includes('Người') && !trimmedLine.includes('(')) ? 'font-bold text-[16px]' : 'italic text-[15px]'}>
                                                                {trimmedLine}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Fallback for empty lines
                                            if (!trimmedLine) return <div key={index} className="h-4" />;

                                            // Regular justified text
                                            return <div key={index} className="indent-0">{line}</div>;
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-10 opacity-40">
                                        <FileText size={160} strokeWidth={1} />
                                        <div className="text-center">
                                            <p className="text-3xl font-bold mb-4">Chưa có bản thảo</p>
                                            <p className="text-xl">Vui lòng điền thông tin bên trái và nhấn nút "Xem Trước"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DocumentGenerator;
