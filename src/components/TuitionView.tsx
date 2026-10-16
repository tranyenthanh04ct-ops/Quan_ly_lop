import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  FileText, 
  CreditCard, 
  Edit, 
  Trash2, 
  Search, 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  Download,
  Filter,
  Plus
} from 'lucide-react';
import { TuitionInvoice, ClassGroup, Student, ActiveTab } from '../types';
import { formatVND } from '../utils/formatters';

interface TuitionViewProps {
  invoices: TuitionInvoice[];
  classes: ClassGroup[];
  students: Student[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onAutoCalculate: (month: string) => void;
  onOpenReceipt: (invoice: TuitionInvoice) => void;
  onOpenRecordPayment: (invoice: TuitionInvoice) => void;
  onEditInvoice: (invoice: TuitionInvoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onCreateCustomInvoice: () => void;
}

export const TuitionView: React.FC<TuitionViewProps> = ({
  invoices,
  classes,
  students,
  currentMonth,
  onMonthChange,
  onAutoCalculate,
  onOpenReceipt,
  onOpenRecordPayment,
  onEditInvoice,
  onDeleteInvoice,
  onCreateCustomInvoice
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Month invoices
  const monthInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchMonth = inv.monthYear === currentMonth;
      const matchClass = selectedClassId === 'all' || inv.classId === selectedClassId;
      const matchStatus = selectedStatus === 'all' || inv.status === selectedStatus;
      const cleanSearch = searchTerm.toLowerCase().trim();
      const matchSearch = !cleanSearch || 
        inv.studentName.toLowerCase().includes(cleanSearch) ||
        inv.className.toLowerCase().includes(cleanSearch) ||
        inv.invoiceCode.toLowerCase().includes(cleanSearch) ||
        (inv.parentPhone && inv.parentPhone.includes(cleanSearch));
      return matchMonth && matchClass && matchStatus && matchSearch;
    });
  }, [invoices, currentMonth, selectedClassId, selectedStatus, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalSubtotal = 0;
    let totalDebtOld = 0;
    let totalAdjustment = 0;
    let totalExpected = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    monthInvoices.forEach(i => {
      totalSubtotal += i.subtotal;
      totalDebtOld += i.previousDebt;
      totalAdjustment += i.adjustmentAmount;
      totalExpected += i.totalAmount;
      totalPaid += i.paidAmount;
      totalRemaining += i.remainingDebt;
    });

    return { totalSubtotal, totalDebtOld, totalAdjustment, totalExpected, totalPaid, totalRemaining };
  }, [monthInvoices]);

  const monthParts = currentMonth.split('-');
  const monthDisplay = `Tháng ${monthParts[1]}/${monthParts[0]}`;

  return (
    <div className="space-y-6">
      {/* Header with Month Selector & Auto Calculation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Bảng tính & Quản lý Học phí
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động tính: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">Số buổi × Đơn giá + Nợ cũ - Giảm trừ</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#4169E1]" />
            <input
              type="month"
              value={currentMonth}
              onChange={e => onMonthChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => onAutoCalculate(currentMonth)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tự động tính theo điểm danh</span>
          </button>

          <button
            onClick={onCreateCustomInvoice}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu thủ công</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tổng học phí lớp</div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            {formatVND(stats.totalSubtotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tiền theo số buổi học</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tổng phải thu</div>
          <div className="text-lg font-bold text-blue-700 tabular-nums">
            {formatVND(stats.totalExpected)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Đã gộp nợ cũ & giảm trừ</div>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 mb-1">Đã thu về</div>
          <div className="text-lg font-bold text-emerald-700 tabular-nums">
            {formatVND(stats.totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Tiền mặt & chuyển khoản</div>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-amber-700 mb-1">Còn nợ lại</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">
            {formatVND(stats.totalRemaining)}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Cần phụ huynh thanh toán</div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Danh sách Phiếu thu {monthDisplay} ({monthInvoices.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class filter */}
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unpaid">Chưa đóng</option>
              <option value="partial">Đóng một phần</option>
              <option value="paid">Đã đóng đủ</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã phiếu, học sinh..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
              />
            </div>
          </div>
        </div>

        {/* Tuition Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-semibold">
                <th className="py-2.5 px-3">Mã phiếu & Học sinh</th>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3 text-center">Số buổi</th>
                <th className="py-2.5 px-3 text-right">Đơn giá</th>
                <th className="py-2.5 px-3 text-right">Thành tiền</th>
                <th className="py-2.5 px-3 text-right">Nợ cũ</th>
                <th className="py-2.5 px-3 text-right">Giảm trừ</th>
                <th className="py-2.5 px-3 text-right">Tổng phải thu</th>
                <th className="py-2.5 px-3 text-right">Đã thu</th>
                <th className="py-2.5 px-3 text-right">Còn nợ</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthInvoices.map(inv => {
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code & Student */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{inv.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.invoiceCode}</div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {inv.className}
                    </td>

                    {/* Sessions count */}
                    <td className="py-3 px-3 text-center font-bold text-slate-900 tabular-nums">
                      <button 
                        onClick={() => onOpenReceipt(inv)}
                        title={`Các ngày học: ${inv.attendedDates?.join(', ') || 'Chưa ghi nhận'}`}
                        className="underline decoration-dotted hover:text-[#4169E1]"
                      >
                        {inv.sessionCount} buổi
                      </button>
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3 text-right text-slate-600 tabular-nums">
                      {formatVND(inv.ratePerSession)}
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums">
                      {formatVND(inv.subtotal)}
                    </td>

                    {/* Old Debt */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {inv.previousDebt > 0 ? (
                        <span className="text-amber-700 font-semibold">+{formatVND(inv.previousDebt)}</span>
                      ) : (
                        <span className="text-slate-400">0 ₫</span>
                      )}
                    </td>

                    {/* Adjustment */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {inv.adjustmentAmount !== 0 ? (
                        <span className={inv.adjustmentAmount < 0 ? 'text-emerald-700 font-semibold' : 'text-blue-700 font-semibold'}>
                          {inv.adjustmentAmount > 0 ? `+${formatVND(inv.adjustmentAmount)}` : formatVND(inv.adjustmentAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0 ₫</span>
                      )}
                    </td>

                    {/* Total Expected */}
                    <td className="py-3 px-3 text-right font-bold text-blue-900 tabular-nums">
                      {formatVND(inv.totalAmount)}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                      {formatVND(inv.paidAmount)}
                    </td>

                    {/* Remaining */}
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      {inv.remainingDebt > 0 ? (
                        <span className="text-amber-700">{formatVND(inv.remainingDebt)}</span>
                      ) : (
                        <span className="text-emerald-600">0 ₫</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inv.status === 'partial'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {inv.status === 'paid' ? 'Đã đóng' : inv.status === 'partial' ? 'Một phần' : 'Chưa đóng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Open Receipt */}
                        <button
                          onClick={() => onOpenReceipt(inv)}
                          title="Xem / In phiếu thu"
                          aria-label={`Xem phiếu thu của ${inv.studentName}`}
                          className="p-1.5 text-slate-600 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Record Payment */}
                        <button
                          onClick={() => onOpenRecordPayment(inv)}
                          title="Thu tiền"
                          aria-label={`Thu tiền học phí của ${inv.studentName}`}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Invoice */}
                        <button
                          onClick={() => onEditInvoice(inv)}
                          title="Chỉnh sửa chiết khấu/nợ"
                          aria-label={`Sửa phiếu thu của ${inv.studentName}`}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          title="Xóa phiếu thu"
                          aria-label={`Xóa phiếu thu của ${inv.studentName}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {monthInvoices.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-slate-400">
                    Chưa có phiếu thu nào cho tháng {monthParts[1]}/{monthParts[0]}.
                    <div className="mt-2">
                      <button
                        onClick={() => onAutoCalculate(currentMonth)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#4169E1] rounded-xl hover:bg-[#3154C4] transition-colors"
                      >
                        ⚡ Nhấn để tự động tính học phí từ lịch điểm danh
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
