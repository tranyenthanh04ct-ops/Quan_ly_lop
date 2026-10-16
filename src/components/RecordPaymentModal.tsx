import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Banknote, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TuitionInvoice } from '../types';
import { formatVND } from '../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: TuitionInvoice[];
  initialInvoice?: TuitionInvoice | null;
  onConfirmPayment: (invoiceId: string, amount: number, method: 'cash' | 'transfer', note?: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoices,
  initialInvoice,
  onConfirmPayment
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'transfer' | 'cash'>('transfer');
  const [note, setNote] = useState<string>('');

  // Unpaid or partially paid invoices
  const pendingInvoices = invoices.filter(i => i.remainingDebt > 0);

  useEffect(() => {
    if (initialInvoice) {
      setSelectedInvoiceId(initialInvoice.id);
      setAmount(initialInvoice.remainingDebt);
    } else if (pendingInvoices.length > 0) {
      setSelectedInvoiceId(pendingInvoices[0].id);
      setAmount(pendingInvoices[0].remainingDebt);
    } else if (invoices.length > 0) {
      setSelectedInvoiceId(invoices[0].id);
      setAmount(invoices[0].remainingDebt);
    }
  }, [initialInvoice, invoices, isOpen]);

  if (!isOpen) return null;

  const currentInvoice = invoices.find(i => i.id === selectedInvoiceId);

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setAmount(inv.remainingDebt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || amount <= 0) return;

    onConfirmPayment(selectedInvoiceId, amount, method, note);

    // If payment covers the full remaining debt, shoot celebratory confetti!
    if (currentInvoice && amount >= currentInvoice.remainingDebt) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ghi nhận Thu học phí</h3>
              <p className="text-[11px] text-slate-500">Lưu biên lai đóng học phí của học sinh</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn phiếu thu cần đóng:
            </label>
            <select
              value={selectedInvoiceId}
              onChange={e => handleInvoiceChange(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              required
            >
              {pendingInvoices.length > 0 && (
                <optgroup label="Cần thu tiền (Chưa đóng / Đóng một phần)">
                  {pendingInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.studentName} — {inv.className} (Nợ: {formatVND(inv.remainingDebt)})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Tất cả phiếu thu">
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.studentName} — {inv.className} ({inv.invoiceCode})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Current Debt Preview */}
          {currentInvoice && (
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Tổng phiếu: </span>
                <strong className="text-slate-800">{formatVND(currentInvoice.totalAmount)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Đã đóng: </span>
                <strong className="text-emerald-700">{formatVND(currentInvoice.paidAmount)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Còn nợ: </span>
                <strong className="text-amber-700">{formatVND(currentInvoice.remainingDebt)}</strong>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền thanh toán lần này (VNĐ):
            </label>
            <div className="relative">
              <input
                type="number"
                min={1000}
                step={10000}
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="Ví dụ: 750000"
                className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
            {currentInvoice && amount !== currentInvoice.remainingDebt && (
              <button
                type="button"
                onClick={() => setAmount(currentInvoice.remainingDebt)}
                className="text-[11px] text-[#4169E1] hover:underline font-semibold mt-1"
              >
                Điền toàn bộ số nợ ({formatVND(currentInvoice.remainingDebt)})
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hình thức thanh toán:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === 'transfer'
                    ? 'bg-blue-50 border-[#4169E1] text-[#4169E1] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Chuyển khoản / VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === 'cash'
                    ? 'bg-amber-50 border-amber-600 text-amber-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tiền mặt trực tiếp</span>
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm (không bắt buộc):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phụ huynh CK lúc 19h, mẹ nộp tại lớp..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Xác nhận thu tiền</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
