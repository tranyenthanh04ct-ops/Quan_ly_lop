import React from 'react';
import { 
  GraduationCap, 
  Plus, 
  Menu, 
  CreditCard, 
  CalendarCheck,
  Building2,
  Database
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { SupabaseConfig } from '../services/supabase';

interface NavbarProps {
  teacher: TeacherProfile;
  supabaseConfig: SupabaseConfig;
  onOpenMobileSidebar: () => void;
  onQuickAttendance: () => void;
  onQuickRecordPayment: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  teacher,
  supabaseConfig,
  onOpenMobileSidebar,
  onQuickAttendance,
  onQuickRecordPayment,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-8 py-3.5 bg-white border-b border-slate-200 shadow-xs">
      {/* Zone 1: Brand Wordmark with Mobile Menu Button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Mở menu"
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="#dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#4169E1] flex items-center justify-center text-white shadow-xs group-hover:bg-[#3154C4] transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Edu<span className="text-[#4169E1]">Fee</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Quản lý lớp & Thu học phí
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Context Center / Quick Status & Institution Info */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600 truncate">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-[#4169E1]" />
          <span className="truncate max-w-[260px]">{teacher.centerName || 'Lớp học của tôi'}</span>
        </div>

        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-600 hover:text-blue-700 transition-colors"
          title={supabaseConfig.connected ? "Supabase đã kết nối đồng bộ" : "Chưa kết nối Supabase (đang lưu trình duyệt)"}
        >
          <Database className={`w-3.5 h-3.5 ${supabaseConfig.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{supabaseConfig.connected ? 'Supabase Đã kết nối' : 'Lưu trữ Cục bộ'}</span>
        </button>
      </div>

      {/* Zone 3: Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onQuickAttendance}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <CalendarCheck className="w-3.5 h-3.5 text-[#4169E1]" />
          <span className="hidden sm:inline">Điểm danh nhanh</span>
          <span className="sm:hidden">Điểm danh</span>
        </button>

        <button
          onClick={onQuickRecordPayment}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Thu tiền</span>
        </button>
      </div>
    </header>
  );
};
