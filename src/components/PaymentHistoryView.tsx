import React, { useState } from 'react';
import { 
  ReceiptText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Search, 
  Trash2, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Calendar,
  Building
} from 'lucide-react';
import { PaymentRecord, TuitionInvoice } from '../types';
import { formatVND, formatDateTimeVN, formatDateVN } from '../utils/formatters';

interface PaymentHistoryViewProps {
  payments: PaymentRecord[];
  invoices: TuitionInvoice[];
  onOpenReceipt: (invoice: TuitionInvoice) => void;
  onOpenRecordPayment: (invoice?: TuitionInvoice) => void;
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({
  payments,
  invoices,
  onOpenReceipt,
  onOpenRecordPayment,
  onDeletePayment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'invoices'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'transfer'>('all');

  // Filter payments
  const filteredPayments = payments.filter(pay => {
    const matchMethod = methodFilter === 'all' || pay.method === methodFilter;
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchSearch = !cleanSearch ||
      pay.studentName.toLowerCase().includes(cleanSearch) ||
      pay.className.toLowerCase().includes(cleanSearch) ||
      (pay.note && pay.note.toLowerCase().includes(cleanSearch));
    return matchMethod && matchSearch;
  });

  // Calculate totals
  const totalAmountCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const transferTotal = payments.filter(p => p.method === 'transfer').reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = payments.filter(p => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Theo dõi & Lịch sử Thu học phí
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu vết chi tiết từng lần phụ huynh đóng tiền mặt hoặc chuyển khoản ngân hàng
          </p>
        </div>

        <button
          onClick={() => onOpenRecordPayment()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>+ Ghi nhận thu tiền mới</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Tổng tiền đã thu vào</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">
            {formatVND(totalAmountCollected)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tổng cộng {payments.length} lượt giao dịch
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Chuyển khoản (VietQR / Banking)</span>
            <ArrowUpRight className="w-4 h-4 text-[#4169E1]" />
          </div>
          <div className="text-xl font-bold text-[#4169E1] tabular-nums">
            {formatVND(transferTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {payments.filter(p => p.method === 'transfer').length} lượt chuyển khoản
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Tiền mặt trực tiếp</span>
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 tabular-nums">
            {formatVND(cashTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {payments.filter(p => p.method === 'cash').length} lượt nộp tiền mặt
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Subtabs and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Subtab Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch sử giao dịch ({filteredPayments.length})
            </button>
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'invoices'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả Phiếu thu ({invoices.length})
            </button>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-wrap items-center gap-2">
            {activeSubTab === 'history' && (
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
              >
                <option value="all">Mọi hình thức</option>
                <option value="transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
              </select>
            )}

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh, lớp, ghi chú..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Payment History List */}
        {activeSubTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-semibold">
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3">Lớp học</th>
                  <th className="py-2.5 px-3">Hình thức</th>
                  <th className="py-2.5 px-3 text-right">Số tiền</th>
                  <th className="py-2.5 px-3">Ghi chú</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => {
                  const inv = invoices.find(i => i.id === payment.invoiceId);

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{payment.paymentDate}</div>
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{payment.studentName}</div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-slate-700">
                        {payment.className}
                      </td>

                      {/* Method */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          payment.method === 'transfer'
                            ? 'bg-blue-50 text-[#4169E1]'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {payment.method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums text-sm">
                        +{formatVND(payment.amount)}
                      </td>

                      {/* Note */}
                      <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                        {payment.note || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {inv && (
                          <button
                            onClick={() => onOpenReceipt(inv)}
                            className="p-1.5 text-slate-500 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition-colors mr-1"
                            title="Xem phiếu thu tương ứng"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePayment(payment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hủy giao dịch này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      Chưa có lịch sử thu tiền nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: All Invoices List */}
        {activeSubTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-semibold">
                  <th className="py-2.5 px-3">Mã phiếu</th>
                  <th className="py-2.5 px-3">Kỳ tháng</th>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3">Lớp học</th>
                  <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                  <th className="py-2.5 px-3 text-right">Đã đóng</th>
                  <th className="py-2.5 px-3 text-right">Còn nợ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Xem phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {inv.invoiceCode}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {inv.monthYear}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {inv.studentName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {inv.className}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      {formatVND(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                      {formatVND(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      {inv.remainingDebt > 0 ? (
                        <span className="text-amber-700">{formatVND(inv.remainingDebt)}</span>
                      ) : (
                        <span className="text-emerald-600">0 ₫</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inv.status === 'partial'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {inv.status === 'paid' ? 'Đã đóng đủ' : inv.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenReceipt(inv)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#4169E1] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Mở phiếu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
