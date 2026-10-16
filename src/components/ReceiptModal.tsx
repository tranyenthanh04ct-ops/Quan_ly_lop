import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  CreditCard, 
  GraduationCap, 
  QrCode,
  Building,
  Phone,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { TuitionInvoice, TeacherProfile } from '../types';
import { formatVND, formatDateVN, getVietQRUrl, generateZaloReminder } from '../utils/formatters';

interface ReceiptModalProps {
  invoice: TuitionInvoice | null;
  teacher: TeacherProfile;
  onClose: () => void;
  onOpenRecordPayment: (invoice: TuitionInvoice) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  teacher,
  onClose,
  onOpenRecordPayment
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedZalo, setCopiedZalo] = useState(false);

  if (!invoice) return null;

  const monthParts = invoice.monthYear.split('-');
  const monthStr = `${monthParts[1]}/${monthParts[0]}`;

  // VietQR URL for bank transfer
  const paymentContent = `${invoice.studentName} Lop ${invoice.className} T${monthParts[1]}`;
  const qrAmount = invoice.remainingDebt > 0 ? invoice.remainingDebt : invoice.totalAmount;
  const qrUrl = getVietQRUrl(
    teacher.bankName,
    teacher.bankAccount,
    teacher.accountHolder,
    qrAmount,
    paymentContent
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `PhieuThu_${invoice.invoiceCode}_${invoice.studentName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyZalo = () => {
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
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Modal Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Chi tiết Phiếu Thu {invoice.invoiceCode}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
              invoice.status === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : invoice.status === 'partial'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {invoice.status === 'paid' ? 'Đã thu đủ' : invoice.status === 'partial' ? 'Đã thu một phần' : 'Chưa thu'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              title="In phiếu thu"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In phiếu</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tải ảnh PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDownloading ? 'Đang xuất...' : 'Tải ảnh PNG'}</span>
            </button>

            <button
              onClick={handleCopyZalo}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                copiedZalo
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Sao chép nội dung gửi Zalo phụ huynh"
            >
              {copiedZalo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedZalo ? 'Đã chép Zalo' : 'Gửi Zalo'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable & Shareable Receipt Container */}
        <div className="max-h-[82vh] overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div 
            ref={receiptRef} 
            id="printable-receipt"
            className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5 text-slate-900"
          >
            {/* Header: Institution Branding */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4169E1] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#4169E1] tracking-tight uppercase">
                    {teacher.centerName || 'LỚP HỌC CHUYÊN NGHIỆP'}
                  </h2>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Giáo viên: <strong>{teacher.name}</strong>
                  </div>
                  {teacher.phone && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                  {teacher.address && (
                    <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                      {teacher.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  PHIẾU THU HỌC PHÍ
                </div>
                <div className="text-xs font-bold text-[#4169E1] mt-0.5">
                  Tháng {monthStr}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Mã: {invoice.invoiceCode}
                </div>
              </div>
            </div>

            {/* Student & Parent Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl text-xs">
              <div>
                <div className="text-slate-500 font-medium">Học sinh:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{invoice.studentName}</div>
                <div className="text-slate-600 mt-0.5">Lớp: <strong className="text-slate-800">{invoice.className}</strong></div>
              </div>

              <div>
                <div className="text-slate-500 font-medium">Người liên hệ / Phụ huynh:</div>
                <div className="font-semibold text-slate-800 mt-0.5">{invoice.parentName || 'Chưa cập nhật'}</div>
                {invoice.parentPhone && (
                  <div className="text-slate-600 mt-0.5">SĐT: <strong className="text-slate-800">{invoice.parentPhone}</strong></div>
                )}
              </div>
            </div>

            {/* Attended Dates Detailed Breakdown */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Chi tiết các buổi học trong tháng:</span>
                <span className="text-[#4169E1]">Tổng {invoice.sessionCount} buổi</span>
              </div>

              {invoice.attendedDates && invoice.attendedDates.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  {invoice.attendedDates.map((dateStr, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-[11px]"
                    >
                      {dateStr}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                  Chưa ghi nhận danh sách ngày học cụ thể.
                </div>
              )}
            </div>

            {/* Financial Ledger Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Khoản mục</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      Học phí khóa học (Tháng {monthStr})
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-semibold">
                      {invoice.sessionCount} buổi
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      {formatVND(invoice.ratePerSession)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      {formatVND(invoice.subtotal)}
                    </td>
                  </tr>

                  {/* Previous Debt if any */}
                  {invoice.previousDebt > 0 && (
                    <tr className="bg-amber-50/40 text-amber-900">
                      <td colSpan={3} className="py-2.5 px-3 font-medium">
                        Công nợ kỳ trước chuyển sang
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-amber-800">
                        +{formatVND(invoice.previousDebt)}
                      </td>
                    </tr>
                  )}

                  {/* Adjustments if any */}
                  {invoice.adjustmentAmount !== 0 && (
                    <tr className="bg-blue-50/40 text-blue-900">
                      <td colSpan={3} className="py-2.5 px-3 font-medium">
                        Điều chỉnh / Giảm trừ {invoice.adjustmentReason ? `(${invoice.adjustmentReason})` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#4169E1]">
                        {invoice.adjustmentAmount > 0 ? `+${formatVND(invoice.adjustmentAmount)}` : formatVND(invoice.adjustmentAmount)}
                      </td>
                    </tr>
                  )}

                  {/* Total calculation */}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={3} className="py-2.5 px-3 text-sm">
                      Tổng tiền học phí cần đóng
                    </td>
                    <td className="py-2.5 px-3 text-right text-base text-[#4169E1] tabular-nums">
                      {formatVND(invoice.totalAmount)}
                    </td>
                  </tr>

                  {/* Paid amount */}
                  <tr className="text-emerald-700 font-semibold">
                    <td colSpan={3} className="py-2 px-3">
                      Số tiền đã thanh toán
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      - {formatVND(invoice.paidAmount)}
                    </td>
                  </tr>

                  {/* Remaining balance */}
                  <tr className="bg-amber-50/70 text-amber-900 font-bold border-t border-amber-200">
                    <td colSpan={3} className="py-2.5 px-3 text-sm">
                      Số tiền còn lại cần nộp
                    </td>
                    <td className="py-2.5 px-3 text-right text-base text-amber-700 tabular-nums">
                      {formatVND(invoice.remainingDebt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bank Transfer QR Code & Bank Information */}
            {teacher.bankAccount && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs space-y-1 text-slate-700 min-w-0 flex-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs mb-1.5">
                    <QrCode className="w-4 h-4 text-[#4169E1]" />
                    <span>THÔNG TIN THANH TOÁN CHUYỂN KHOẢN (VIETQR)</span>
                  </div>
                  <div>Ngân hàng: <strong>{teacher.bankName}</strong></div>
                  <div>Số tài khoản: <strong className="font-mono text-sm text-[#4169E1] tracking-wide">{teacher.bankAccount}</strong></div>
                  <div>Chủ tài khoản: <strong className="uppercase">{teacher.accountHolder}</strong></div>
                  <div>Cú pháp chuyển khoản: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">[{paymentContent}]</span></div>
                  {teacher.noteTemplate && (
                    <div className="text-[11px] text-slate-500 italic pt-1">{teacher.noteTemplate}</div>
                  )}
                </div>

                {qrUrl && (
                  <div className="shrink-0 flex flex-col items-center bg-white p-2 border border-slate-200 rounded-xl shadow-xs">
                    <img 
                      src={qrUrl} 
                      alt="VietQR Chuyển khoản" 
                      className="w-28 h-28 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">Quét mã bằng app Ngân hàng</span>
                  </div>
                )}
              </div>
            )}

            {/* Signature & Confirmation Footnote */}
            <div className="pt-4 flex items-end justify-between text-xs text-slate-500 border-t border-slate-100">
              <div className="text-[11px]">
                <p>Cảm ơn Quý phụ huynh đã đồng hành cùng lớp học!</p>
                <p className="text-slate-400">Phiếu thu điện tử lập tự động qua hệ thống EduFee</p>
              </div>

              <div className="text-center font-medium">
                <div>Giáo viên phụ trách</div>
                <div className="mt-8 font-bold text-slate-900">{teacher.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-t border-slate-200 no-print">
          <div className="text-xs text-slate-500">
            {invoice.remainingDebt > 0 ? (
              <span>Còn nợ: <strong className="text-amber-700 tabular-nums">{formatVND(invoice.remainingDebt)}</strong></span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Học sinh đã hoàn thành học phí
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {invoice.remainingDebt > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordPayment(invoice);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ghi nhận đóng tiền</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
