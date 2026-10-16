import React, { useState, useEffect } from 'react';
import { X, Edit, Check } from 'lucide-react';
import { TuitionInvoice } from '../types';
import { formatVND } from '../utils/formatters';

interface InvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: TuitionInvoice | null;
  onSave: (id: string, updates: Partial<TuitionInvoice>) => void;
}

export const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSave
}) => {
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [ratePerSession, setRatePerSession] = useState<number>(0);
  const [previousDebt, setPreviousDebt] = useState<number>(0);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (invoice) {
      setSessionCount(invoice.sessionCount);
      setRatePerSession(invoice.ratePerSession);
      setPreviousDebt(invoice.previousDebt);
      setAdjustmentAmount(invoice.adjustmentAmount);
      setAdjustmentReason(invoice.adjustmentReason || '');
      setNotes(invoice.notes || '');
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const subtotal = sessionCount * ratePerSession;
  const totalAmount = subtotal + previousDebt + adjustmentAmount;
  const remainingDebt = Math.max(0, totalAmount - invoice.paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(invoice.id, {
      sessionCount,
      ratePerSession,
      subtotal,
      previousDebt,
      adjustmentAmount,
      adjustmentReason: adjustmentReason.trim() || undefined,
      totalAmount,
      remainingDebt,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4169E1] flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Điều chỉnh Phiếu Thu {invoice.invoiceCode}
              </h3>
              <p className="text-[11px] text-slate-500">{invoice.studentName} — {invoice.className}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số buổi tính phí:
              </label>
              <input
                type="number"
                min={0}
                required
                value={sessionCount}
                onChange={e => setSessionCount(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn giá / Buổi (VNĐ):
              </label>
              <input
                type="number"
                step={5000}
                required
                value={ratePerSession}
                onChange={e => setRatePerSession(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nợ kỳ trước (VNĐ):
              </label>
              <input
                type="number"
                step={10000}
                value={previousDebt}
                onChange={e => setPreviousDebt(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giảm trừ / Phụ thu (VNĐ):
              </label>
              <input
                type="number"
                step={10000}
                placeholder="Nhập âm (-) để giảm giá"
                value={adjustmentAmount}
                onChange={e => setAdjustmentAmount(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do giảm trừ / phụ thu:
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Học bổng khuyến học, Phụ thu tài liệu ôn thi..."
              value={adjustmentReason}
              onChange={e => setAdjustmentReason(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú trên phiếu thu:
            </label>
            <input
              type="text"
              placeholder="Ghi chú hiển thị cho phụ huynh..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
            />
          </div>

          {/* Dynamic Total Preview */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Thành tiền ({sessionCount} buổi):</span>
              <span className="font-semibold tabular-nums">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold text-sm pt-1 border-t border-blue-200/50">
              <span>Tổng tiền mới:</span>
              <span className="text-[#4169E1] tabular-nums">{formatVND(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-semibold text-xs">
              <span>Còn lại sau khi trừ đã đóng:</span>
              <span className="tabular-nums">{formatVND(remainingDebt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Cập nhật phiếu thu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
