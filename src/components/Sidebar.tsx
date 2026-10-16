import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Calculator, 
  ReceiptText, 
  Settings, 
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';
import { ActiveTab, TeacherProfile } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  teacher: TeacherProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  teacher,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Bảng điều khiển',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'classes',
      label: 'Lớp học & Học sinh',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'schedule',
      label: 'Lịch dạy & Điểm danh',
      icon: <CalendarDays className="w-4 h-4" />
    },
    {
      id: 'tuition',
      label: 'Tính & Thu học phí',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      id: 'payments',
      label: 'Phiếu thu & Lịch sử',
      icon: <ReceiptText className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Cài đặt & Supabase',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Chức năng chính
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-[#4169E1] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#4169E1]' : 'text-slate-400 group-hover:text-slate-600'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Feature Highlights Box */}
        <div className="mt-6 p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4169E1] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mẹo dành cho Giáo viên</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Học phí được tính tự động từ lịch sử điểm danh. Bạn có thể in phiếu hoặc gửi mã VietQR trực tiếp cho phụ huynh.
          </p>
        </div>
      </div>

      {/* Teacher Profile Footer Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#4169E1] flex items-center justify-center font-bold text-xs shrink-0">
            {teacher.name.charAt(0) || 'G'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 truncate">
              {teacher.name || 'Giáo viên'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Phone className="w-3 h-3 text-slate-400" />
              <span className="truncate">{teacher.phone || 'Chưa cập nhật SĐT'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-[61px] h-[calc(100vh-61px)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
