import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Copy,
  Check,
  CreditCard,
  FileText,
  Plus
} from 'lucide-react';
import { 
  ClassGroup, 
  Student, 
  ClassSession, 
  TuitionInvoice, 
  TeacherProfile, 
  ActiveTab 
} from '../types';
import { formatVND, formatDateVN, getDayOfWeekVN, generateZaloReminder } from '../utils/formatters';

interface DashboardViewProps {
  teacher: TeacherProfile;
  classes: ClassGroup[];
  students: Student[];
  sessions: ClassSession[];
  invoices: TuitionInvoice[];
  currentMonth: string;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAttendanceForSession: (sessionId: string) => void;
  onOpenReceipt: (invoice: TuitionInvoice) => void;
  onOpenRecordPayment: (invoice?: TuitionInvoice) => void;
  onOpenAddStudent: () => void;
  onOpenAddClass: () => void;
  onAutoCalculateTuition: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  classes,
  students,
  sessions,
  invoices,
  currentMonth,
  onSelectTab,
  onOpenAttendanceForSession,
  onOpenReceipt,
  onOpenRecordPayment,
  onOpenAddStudent,
  onOpenAddClass,
  onAutoCalculateTuition
}) => {
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Month calculations
  const monthInvoices = invoices.filter(i => i.monthYear === currentMonth);
  const totalExpected = monthInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = monthInvoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDebt = monthInvoices.reduce((acc, curr) => acc + curr.remainingDebt, 0);

  const activeStudents = students.filter(s => s.status === 'active');
  const monthSessions = sessions.filter(s => s.date.startsWith(currentMonth));
  const completedSessions = monthSessions.filter(s => s.status === 'completed');

  // Today and upcoming sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingSessions = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // Invoices pending collection
  const pendingInvoices = monthInvoices
    .filter(i => i.remainingDebt > 0)
    .sort((a, b) => b.remainingDebt - a.remainingDebt)
    .slice(0, 5);

  const collectionPercent = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const handleCopyZalo = (invoice: TuitionInvoice) => {
    const text = generateZaloReminder(
      teacher.name,
      teacher.centerName,
      invoice.studentName,
      invoice.className,
      invoice.monthYear,
      invoice.sessionCount,
      invoice.ratePerSession,
      invoice.totalAmount,
      invoice.remainingDebt,
      teacher.bankName,
      teacher.bankAccount,
      teacher.accountHolder
    );
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(invoice.id);
    setTimeout(() => setCopiedInvoiceId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-900 via-[#4169E1] to-blue-600 rounded-2xl text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-1">
            <span>Tháng {currentMonth.split('-')[1]} năm {currentMonth.split('-')[0]}</span>
            <span aria-hidden="true">·</span>
            <span>{teacher.centerName}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Xin chào, {teacher.name}!
          </h1>
          <p className="text-xs text-blue-100/90 mt-1">
            Hôm nay bạn có {sessions.filter(s => s.date === todayStr).length} buổi học cần dạy và điểm danh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm học sinh</span>
          </button>
          <button
            onClick={onAutoCalculateTuition}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-[#4169E1] hover:bg-blue-50 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Tính học phí tháng này</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Học sinh</span>
            <Users className="w-4 h-4 text-[#4169E1]" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {activeStudents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Đang theo học
          </div>
        </div>

        {/* Total Classes */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Số lớp</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {classes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Đang hoạt động
          </div>
        </div>

        {/* Sessions Month */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Buổi dạy</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {completedSessions.length} <span className="text-xs font-normal text-slate-400">/ {monthSessions.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Đã hoàn thành
          </div>
        </div>

        {/* Expected Revenue */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Dự kiến thu</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums truncate">
            {formatVND(totalExpected)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {monthInvoices.length} phiếu thu
          </div>
        </div>

        {/* Collected */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Đã thu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700 tabular-nums truncate">
            {formatVND(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Đạt {collectionPercent}%
          </div>
        </div>

        {/* Remaining Debt */}
        <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Còn nợ</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-amber-700 tabular-nums truncate">
            {formatVND(totalDebt)}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            {pendingInvoices.length} học sinh
          </div>
        </div>
      </div>

      {/* Financial Progress Banner */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tiến độ thu học phí tháng {currentMonth.split('-')[1]}
            </h3>
            <p className="text-xs text-slate-500">
              Đã thu {formatVND(totalCollected)} trên tổng số {formatVND(totalExpected)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4169E1]">
            <span className="tabular-nums">{collectionPercent}%</span>
            <span className="text-slate-400">hoàn thành</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div 
            className="bg-[#4169E1] h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, collectionPercent)}%` }}
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${Math.max(0, 100 - collectionPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4169E1]" />
            <span>Đã thanh toán: <strong className="text-slate-700 tabular-nums">{formatVND(totalCollected)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Chưa thu: <strong className="text-slate-700 tabular-nums">{formatVND(totalDebt)}</strong></span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Schedule / Attendance & Pending Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Schedule & Attendance Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch dạy & Điểm danh gần nhất
                </h3>
                <p className="text-xs text-slate-500">
                  Nhấn "Điểm danh" để chấm nhanh buổi học
                </p>
              </div>
              <button
                onClick={() => onSelectTab('schedule')}
                className="flex items-center gap-1 text-xs font-semibold text-[#4169E1] hover:underline"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingSessions.map(sess => {
                const cls = classes.find(c => c.id === sess.classId);
                const isToday = sess.date === todayStr;
                return (
                  <div
                    key={sess.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isToday 
                        ? 'bg-blue-50/60 border-blue-200' 
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {cls?.name || 'Lớp học'}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#4169E1] text-white rounded-md">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{getDayOfWeekVN(sess.date)} {formatDateVN(sess.date)}</span>
                        <span>·</span>
                        <span>{sess.startTime} - {sess.endTime}</span>
                        {sess.title && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[140px] italic">{sess.title}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenAttendanceForSession(sess.id)}
                      className="ml-3 px-3 py-1.5 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-lg shadow-xs transition-colors whitespace-nowrap"
                    >
                      Điểm danh
                    </button>
                  </div>
                );
              })}

              {upcomingSessions.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  Chưa có lịch dạy nào. Hãy thêm buổi học mới!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng {sessions.length} buổi học đã được thiết lập</span>
            <button
              onClick={() => onSelectTab('schedule')}
              className="font-medium text-[#4169E1] hover:underline"
            >
              + Tạo thêm lịch học
            </button>
          </div>
        </div>

        {/* Right: Unpaid / Pending Tuition reminder list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cần thu học phí ({pendingInvoices.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Học sinh chưa hoàn tất học phí tháng này
                </p>
              </div>
              <button
                onClick={() => onSelectTab('tuition')}
                className="flex items-center gap-1 text-xs font-semibold text-[#4169E1] hover:underline"
              >
                <span>Xem bảng tính</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingInvoices.map(inv => {
                const isCopied = copiedInvoiceId === inv.id;
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {inv.studentName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          ({inv.className})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span>Số buổi: <strong className="text-slate-800">{inv.sessionCount}</strong></span>
                        <span>·</span>
                        <span className="text-amber-700 font-semibold tabular-nums">
                          Nợ: {formatVND(inv.remainingDebt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      {/* Copy Zalo Reminder */}
                      <button
                        onClick={() => handleCopyZalo(inv)}
                        title="Sao chép lời nhắc Zalo"
                        className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          isCopied 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* View Receipt */}
                      <button
                        onClick={() => onOpenReceipt(inv)}
                        title="Xem phiếu thu"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Record payment */}
                      <button
                        onClick={() => onOpenRecordPayment(inv)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                      >
                        Thu tiền
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingInvoices.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/70 rounded-xl border border-slate-200">
                  {monthInvoices.length === 0 
                    ? 'Chưa có phiếu thu nào cho tháng này. Sau khi điểm danh các buổi học, hãy bấm "Tính học phí tháng này".'
                    : 'Tuyệt vời! Tất cả học sinh đã hoàn tất học phí tháng này.'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mẹo: Bạn có thể sao chép nhanh tin nhắn nhắc học phí có sẵn số tài khoản & VietQR</span>
            <button
              onClick={() => onSelectTab('payments')}
              className="font-medium text-[#4169E1] hover:underline"
            >
              Lịch sử đã thu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
