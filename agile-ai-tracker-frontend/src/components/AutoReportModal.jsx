import { useState, useEffect, useRef,useMemo } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Printer, X, RefreshCw, 
  Sparkles, AlertTriangle, CheckCircle2, Calendar, User
} from 'lucide-react';
import { Button } from './ui';

const API_BASE = 'http://localhost:5000/api';

export default function AutoReportModal({ isOpen, onClose, projectId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);
  const [refCode, setRefCode] = useState('');
  const currentDate = useMemo(() => {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const url = projectId 
          ? `${API_BASE}/reports/auto?projectId=${projectId}` 
          : `${API_BASE}/reports/auto`;
          
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
        setRefCode(Date.now().toString().slice(-6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, projectId]);

  // 1. Hàm Xuất PDF / In trang theo layout A4 chuyên nghiệp
  const handlePrint = () => {
    window.print();
  };

  // 2. Hàm Xuất CSV / Excel theo cấu trúc phân cấp
  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // Hỗ trợ Tiếng Việt có dấu
    csvContent += `BÁO CÁO TỰ ĐỘNG - HỆ THỐNG FJRA AGILE\n`;
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n`;
    csvContent += `Vai trò phân tích: ${report.role}\n`;
    csvContent += `Tóm tắt: "${report.data.summary.replace(/"/g, '""')}"\n\n`;

    if (report.role === 'ADMIN') {
      csvContent += `Chỉ số,Giá trị\n`;
      csvContent += `Tổng dự án,${report.data.metrics.totalProjects}\n`;
      csvContent += `Sprint đang hoạt động,${report.data.metrics.activeSprints}\n`;
      csvContent += `Tổng task,${report.data.metrics.totalTasks}\n`;
      csvContent += `Task hoàn thành,${report.data.metrics.doneTasks}\n`;
      csvContent += `Task quá hạn,${report.data.metrics.overdueTasks}\n`;
      csvContent += `Tỷ lệ hoàn thành,${report.data.metrics.completionRate}\n`;
    } else if (report.role === 'PM') {
      csvContent += `Thành viên,Tổng task,Hoàn thành,Đang chờ\n`;
      Object.entries(report.data.workload).forEach(([name, stat]) => {
        csvContent += `"${name}",${stat.total},${stat.done},${stat.pending}\n`;
      });
    } else if (report.role === 'MEMBER') {
      csvContent += `Tên Task,Hạn chót,Mức độ ưu tiên\n`;
      report.data.overdueTasks.forEach(task => {
        csvContent += `"${task.title}","${new Date(task.dueDate).toLocaleDateString('vi-VN')}","${task.priority}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FJra_Report_${report.role}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 print:p-0 print:bg-white print:fixed">
      {/* Container Báo cáo */}
      <div 
        ref={printRef}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] max-w-3xl w-full max-h-[92vh] flex flex-col font-sans print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full"
      >
        {/* Header Hành động (Ẩn khi in ấn) */}
        <div className="h-14 px-6 border-b border-[#DFE1E6] flex items-center justify-between shrink-0 print:hidden bg-[#FAFBFC]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0052CC]" />
            <h2 className="text-sm font-bold text-[#172B4D]">Báo Cáo Tự Động Định Kỳ</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="subtle" size="sm" onClick={handleExportCSV} title="Tải file Excel / CSV">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Xuất CSV</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} title="In hoặc lưu dạng PDF">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>In / Lưu PDF</span>
            </Button>
            <button onClick={onClose} className="p-1.5 text-[#626F86] hover:text-[#172B4D] ml-2 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung Trang Báo Cáo (Format chuẩn A4 Document) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 print:overflow-visible text-[#172B4D]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#626F86]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0052CC] mb-2" />
              <span className="text-xs">Đang tổng hợp và kết xuất báo cáo...</span>
            </div>
          ) : !report ? (
            <div className="text-center py-12 text-xs text-[#626F86]">Không có dữ liệu báo cáo</div>
          ) : (
            <>
              {/* Header Văn Bản Báo Cáo */}
              <div className="border-b-2 border-[#0052CC] pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#0052CC] text-white text-[10px] font-bold rounded">FJRA SYSTEM</span>
                    <span className="text-xs font-mono text-[#626F86]">{currentDate}</span>
                    
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-[#172B4D] uppercase">
                    {report.data.title || 'Báo Cáo Tiến Độ Hệ Thống'}
                  </h1>
                  <p className="text-xs text-[#626F86] mt-0.5">
                    Phân tích số liệu tự động theo vai trò người dùng
                  </p>
                </div>
                <div className="text-right text-xs text-[#626F86] space-y-1">
                  <div className="flex items-center justify-end gap-1 font-medium text-[#172B4D]">
                    <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <User className="w-3.5 h-3.5 text-[#626F86]" />
                    <span>Vai trò: <strong className="text-[#0052CC] font-mono">{report.role}</strong></span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt Điều hành (Executive Summary) */}
              <div className="bg-[#F4F5F7] border-l-4 border-[#0052CC] p-4 rounded-r-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0052CC] uppercase tracking-wide mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Tóm Tắt & Đánh Giá Tự Động</span>
                </div>
                <p className="text-xs text-[#172B4D] leading-relaxed">
                  {report.data.summary}
                </p>
              </div>

              {/* KHỐI 1: ROLE ADMIN */}
              {report.role === 'ADMIN' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#626F86] mb-3">Chỉ số vận hành cốt lõi (KPIs)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border border-[#DFE1E6] rounded p-4 bg-[#FAFBFC]">
                        <span className="text-[11px] text-[#626F86] block">Tổng Dự Án Quản Lý</span>
                        <span className="text-2xl font-bold text-[#172B4D] mt-1 block">{report.data.metrics.totalProjects}</span>
                        <span className="text-[10px] text-[#36B37E] font-medium">Toàn hệ sinh thái</span>
                      </div>
                      <div className="border border-[#DFE1E6] rounded p-4 bg-[#FAFBFC]">
                        <span className="text-[11px] text-[#626F86] block">Sprint Đang Vận Hành</span>
                        <span className="text-2xl font-bold text-[#0052CC] mt-1 block">{report.data.metrics.activeSprints}</span>
                        <span className="text-[10px] text-[#0052CC] font-medium">Đang trong chu kỳ</span>
                      </div>
                      <div className="border border-[#DFE1E6] rounded p-4 bg-[#FAFBFC]">
                        <span className="text-[11px] text-[#626F86] block">Tỷ Lệ Xong Toàn Sàn</span>
                        <span className="text-2xl font-bold text-[#36B37E] mt-1 block">{report.data.metrics.completionRate}</span>
                        <span className="text-[10px] text-[#626F86] font-medium">{report.data.metrics.doneTasks} / {report.data.metrics.totalTasks} tasks</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#DFE1E6] rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[#626F86] uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Hạng mục kiểm toán</th>
                          <th className="py-2.5 px-4">Số lượng</th>
                          <th className="py-2.5 px-4">Đánh giá rủi ro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE1E6]">
                        <tr>
                          <td className="py-2.5 px-4 font-medium">Công việc hoàn thành (Done)</td>
                          <td className="py-2.5 px-4 font-bold text-[#36B37E]">{report.data.metrics.doneTasks}</td>
                          <td className="py-2.5 px-4 text-[#36B37E]">An toàn</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium">Công việc quá hạn (Overdue)</td>
                          <td className="py-2.5 px-4 font-bold text-[#DE350B]">{report.data.metrics.overdueTasks}</td>
                          <td className="py-2.5 px-4 text-[#DE350B]">Cần đôn đốc</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* KHỐI 2: ROLE PM */}
              {report.role === 'PM' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                      <span className="text-[10px] text-[#626F86] block">CẦN LÀM</span>
                      <strong className="text-lg text-[#172B4D]">{report.data.taskOverview.todo}</strong>
                    </div>
                    <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                      <span className="text-[10px] text-[#0052CC] block">ĐANG LÀM</span>
                      <strong className="text-lg text-[#0052CC]">{report.data.taskOverview.inProgress}</strong>
                    </div>
                    <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                      <span className="text-[10px] text-[#36B37E] block">HOÀN THÀNH</span>
                      <strong className="text-lg text-[#36B37E]">{report.data.taskOverview.done}</strong>
                    </div>
                    <div className="p-3 border border-[#FFBDAD] rounded bg-[#FFEBE6]">
                      <span className="text-[10px] text-[#DE350B] block">QUÁ HẠN</span>
                      <strong className="text-lg text-[#DE350B]">{report.data.taskOverview.overdue}</strong>
                    </div>
                  </div>

                  {/* Bảng phân bổ Workload */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#626F86] mb-2">Bảng Phân Bổ Công Việc Theo Nhân Sự (Workload)</h3>
                    <div className="border border-[#DFE1E6] rounded overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[#626F86] uppercase font-semibold">
                          <tr>
                            <th className="py-2.5 px-4">Nhân sự</th>
                            <th className="py-2.5 px-4 text-center">Tổng Task</th>
                            <th className="py-2.5 px-4 text-center">Đã Xong</th>
                            <th className="py-2.5 px-4 text-center">Đang Chờ</th>
                            <th className="py-2.5 px-4 text-right">Tỷ lệ xong</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE1E6]">
                          {Object.entries(report.data.workload).map(([name, stat]) => {
                            const percent = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
                            return (
                              <tr key={name}>
                                <td className="py-2.5 px-4 font-semibold text-[#172B4D]">{name}</td>
                                <td className="py-2.5 px-4 text-center">{stat.total}</td>
                                <td className="py-2.5 px-4 text-center text-[#36B37E] font-medium">{stat.done}</td>
                                <td className="py-2.5 px-4 text-center text-[#DE350B] font-medium">{stat.pending}</td>
                                <td className="py-2.5 px-4 text-right font-mono font-medium">{percent}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* KHỐI 3: ROLE MEMBER */}
              {report.role === 'MEMBER' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                      <span className="text-xs text-[#626F86]">Tổng Nhiệm Vụ Phụ Trách</span>
                      <span className="text-2xl font-bold text-[#172B4D] block mt-1">{report.data.overview.total}</span>
                    </div>
                    <div className="p-4 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                      <span className="text-xs text-[#36B37E]">Nhiệm Vụ Đã Đạt (Done)</span>
                      <span className="text-2xl font-bold text-[#36B37E] block mt-1">{report.data.overview.done}</span>
                    </div>
                    <div className="p-4 border border-[#FFBDAD] rounded bg-[#FFEBE6]">
                      <span className="text-xs text-[#DE350B]">Nhiệm Vụ Trễ Hạn</span>
                      <span className="text-2xl font-bold text-[#DE350B] block mt-1">{report.data.overview.overdueCount}</span>
                    </div>
                  </div>

                  {report.data.overdueTasks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#DE350B] flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Danh Sách Công Việc Quá Hạn Cần Ưu Tiên
                      </h3>
                      <div className="border border-[#FFBDAD] rounded overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FFF5F5] border-b border-[#FFBDAD] text-[#DE350B] uppercase font-semibold">
                            <tr>
                              <th className="py-2 px-3">Tên Công Việc</th>
                              <th className="py-2 px-3">Mức Ưu Tiên</th>
                              <th className="py-2 px-3 text-right">Hạn Chót</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FFBDAD]">
                            {report.data.overdueTasks.map(t => (
                              <tr key={t.id}>
                                <td className="py-2 px-3 font-medium text-[#172B4D]">{t.title}</td>
                                <td className="py-2 px-3">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFEBE6] text-[#DE350B]">
                                    {t.priority}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-[#DE350B]">
                                  {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chữ ký / Xác thực cuối văn bản báo cáo */}
              <div className="pt-10 border-t border-[#DFE1E6] flex justify-between items-end text-xs text-[#626F86]">
                <div>
                  <p className="font-semibold text-[#172B4D]">FJra Project Management Platform</p>
                  <p className="text-[11px] text-[#626F86]">Hệ thống trích xuất dữ liệu tự động theo thời gian thực.</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-[#DFE1E6] w-36 mb-1"></div>
                  <p className="text-[11px] font-medium text-[#172B4D]">Xác nhận của Người Lập</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}