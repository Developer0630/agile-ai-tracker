import React from 'react';
import { 
  Kanban, Zap, ShieldCheck, BarChart3, Users, CheckCircle, 
  ArrowRight, Sparkles, BookOpen, Layers 
} from 'lucide-react';
import { Button } from '../components/ui';

export default function LandingPage({ onGoToLogin, onGoToRegister }) {
  return (
    <div className="mineral-landing min-h-screen bg-white text-[#172B4D] flex flex-col font-sans selection:bg-[#DEEBFF] selection:text-[#0052CC]">
      {/* 1. Header Điều hướng */}
      <header className="h-16 border-b border-[#DFE1E6] px-6 md:px-12 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] flex items-center justify-center text-white shadow-sm font-bold">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-[#172B4D]">FJra Platform</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#44546F]">
          <a href="#features" className="hover:text-[#0052CC] transition">Tính năng</a>
          <a href="#guide" className="hover:text-[#0052CC] transition">Hướng dẫn nhanh</a>
          <a href="#roles" className="hover:text-[#0052CC] transition">Phân quyền</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="subtle" size="sm" onClick={onGoToLogin}>
            Đăng nhập
          </Button>
          <Button variant="primary" size="sm" onClick={onGoToRegister}>
            Bắt đầu miễn phí <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F2FF] text-[#0052CC] text-xs font-medium border border-[#B3D4FF]">
          <Sparkles className="w-3.5 h-3.5" /> Quản lý dự án Agile & Scrum thế hệ mới
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#172B4D] leading-tight">
          Vận hành Sprint mượt mà, <br className="hidden md:block" />
          bàn giao sản phẩm đúng tiến độ cùng <span className="text-[#0052CC]">FJra</span>
        </h1>

        <p className="text-sm md:text-base text-[#626F86] max-w-2xl mx-auto leading-relaxed">
          Nền tảng tinh gọn lấy cảm hứng từ Jira: từ Backlog, lập kế hoạch Sprint, bảng Kanban kéo thả, đến báo cáo tự động và quản trị phân quyền doanh nghiệp.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={onGoToRegister} className="px-6 py-2.5 text-sm font-semibold">
            Tạo tài khoản ngay
          </Button>
          <Button variant="secondary" size="md" onClick={onGoToLogin} className="px-6 py-2.5 text-sm font-semibold">
            Xem bản Demo
          </Button>
        </div>

        {/* Demo Preview Frame */}
        <div className="mt-12 rounded-lg border border-[#DFE1E6] p-2 bg-[#F4F5F7] shadow-xl overflow-hidden">
          <div className="bg-white rounded border border-[#DFE1E6] p-4 text-left">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5630]"></span>
                <span className="w-3 h-3 rounded-full bg-[#FFAB00]"></span>
                <span className="w-3 h-3 rounded-full bg-[#36B37E]"></span>
                <span className="text-xs font-mono font-bold text-[#626F86] ml-2">FJRA / Active Sprint Board</span>
              </div>
              <span className="text-[11px] bg-[#E3FCEF] text-[#006644] px-2 py-0.5 rounded font-bold uppercase">Sprint 1 • Active</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 space-y-2">
                <span className="text-[11px] font-bold text-[#44546F] uppercase">To Do (2)</span>
                <div className="bg-white p-2 rounded border border-[#DFE1E6] text-xs shadow-xs">
                  <div className="text-[10px] font-mono text-[#0052CC] font-bold">FJRA-101</div>
                  <div className="font-medium text-[#172B4D] mt-0.5">Xây dựng Landing Page</div>
                </div>
              </div>
              <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 space-y-2">
                <span className="text-[11px] font-bold text-[#0052CC] uppercase">In Progress (1)</span>
                <div className="bg-white p-2 rounded border border-[#0052CC] text-xs shadow-xs">
                  <div className="text-[10px] font-mono text-[#0052CC] font-bold">FJRA-98</div>
                  <div className="font-medium text-[#172B4D] mt-0.5">Cấu hình Heartbeat Online</div>
                </div>
              </div>
              <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 space-y-2">
                <span className="text-[11px] font-bold text-[#36B37E] uppercase">Done (4)</span>
                <div className="bg-white p-2 rounded border border-[#DFE1E6] text-xs shadow-xs opacity-75">
                  <div className="text-[10px] font-mono text-[#0052CC] font-bold">FJRA-85</div>
                  <div className="line-through text-[#626F86] mt-0.5">Báo cáo tự động theo Role</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tính năng Cốt lõi (Core Features) */}
      <section id="features" className="py-16 bg-[#FAFBFC] border-y border-[#DFE1E6] px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-[#0052CC] uppercase tracking-wider">Bộ Công Cụ Hoàn Chỉnh</h2>
            <p className="text-2xl font-bold text-[#172B4D]">Mọi thứ bạn cần để phát triển phần mềm chuyên nghiệp</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#DFE1E6] rounded p-5 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded bg-[#E9F2FF] flex items-center justify-center text-[#0052CC]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Backlog & Sprint Planning</h3>
              <p className="text-xs text-[#626F86] leading-relaxed">
                Lập kế hoạch công việc dễ dàng. Kéo thả đầu việc từ Backlog vào Sprint và kích hoạt chỉ bằng 1 thao tác.
              </p>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded p-5 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded bg-[#E3FCEF] flex items-center justify-center text-[#006644]">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Bảng Kanban Kéo Thả</h3>
              <p className="text-xs text-[#626F86] leading-relaxed">
                Theo dõi tiến độ trực quan với định danh Task Key chuẩn hóa (`FJRA-1`, `FJRA-2`) cùng cập nhật trạng thái tức thì.
              </p>
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded p-5 space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded bg-[#EAE6FF] flex items-center justify-center text-[#6554C0]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Báo Cáo Tự Động & In PDF</h3>
              <p className="text-xs text-[#626F86] leading-relaxed">
                Tự động tổng hợp số liệu theo vai trò (Admin / PM / Member), cho phép xuất file Excel và in văn bản PDF A4 chuyên nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Hướng dẫn nhanh (Quick Start Guide) */}
      <section id="guide" className="py-16 px-6 md:px-12 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-[#0052CC] uppercase tracking-wider">Quy Trình 3 Bước</h2>
          <p className="text-2xl font-bold text-[#172B4D]">Bắt đầu với FJra chỉ trong 2 phút</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-2 border-[#0052CC] pl-4 space-y-1">
            <span className="text-xs font-mono font-bold text-[#0052CC]">BƯỚC 1</span>
            <h4 className="text-sm font-bold text-[#172B4D]">Tạo Dự Án</h4>
            <p className="text-xs text-[#626F86]">Đặt tên dự án và mã Key định danh (VD: `PROJ`). Thêm các thành viên vào nhóm.</p>
          </div>

          <div className="border-l-2 border-[#0052CC] pl-4 space-y-1">
            <span className="text-xs font-mono font-bold text-[#0052CC]">BƯỚC 2</span>
            <h4 className="text-sm font-bold text-[#172B4D]">Lên Backlog & Sprint</h4>
            <p className="text-xs text-[#626F86]">Thêm các nhiệm vụ (Tasks), gán người làm và kéo vào Sprint để bắt đầu chu kỳ.</p>
          </div>

          <div className="border-l-2 border-[#0052CC] pl-4 space-y-1">
            <span className="text-xs font-mono font-bold text-[#0052CC]">BƯỚC 3</span>
            <h4 className="text-sm font-bold text-[#172B4D]">Vận Hành & Báo Cáo</h4>
            <p className="text-xs text-[#626F86]">Kéo thả trạng thái trên Kanban Board và bấm trích xuất báo cáo tự động khi hoàn thành.</p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-[#DFE1E6] py-8 px-6 md:px-12 bg-white text-xs text-[#626F86] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#172B4D]">FJra Agile Platform</span>
          <span>• Hệ thống quản trị tiến độ dự án tinh gọn</span>
        </div>
        <div>
          © {new Date().getFullYear()} FJra System. Thiết kế theo tiêu chuẩn Atlassian Agile.
        </div>
      </footer>
    </div>
  );
}