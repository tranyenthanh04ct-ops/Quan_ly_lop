/**
 * Utility functions for currency, dates, and VietQR generation
 */

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export function formatNumberOnly(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  } catch {
    return dateStr;
  }
}

export function getDayOfWeekVN(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDay();
    const map = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return map[day] || '';
  } catch {
    return '';
  }
}

/**
 * Generate standard VietQR image link
 * Format: https://img.vietqr.io/image/<BANK_CODE>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
 */
export function getVietQRUrl(
  bankCode: string,
  accountNo: string,
  accountHolder: string,
  amount: number,
  content: string
): string {
  if (!bankCode || !accountNo) return '';
  const cleanBank = encodeURIComponent(bankCode.trim().toUpperCase());
  const cleanAcc = encodeURIComponent(accountNo.trim());
  const cleanAmount = Math.max(0, Math.round(amount));
  const cleanInfo = encodeURIComponent(content.slice(0, 50));
  const cleanName = encodeURIComponent(accountHolder.trim().toUpperCase());

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${cleanAmount}&addInfo=${cleanInfo}&accountName=${cleanName}`;
}

export function generateInvoiceCode(monthYear: string, sequence: number): string {
  const cleanMonth = monthYear.replace('-', '');
  return `PT-${cleanMonth}-${String(sequence).padStart(3, '0')}`;
}

export function generateZaloReminder(
  teacherName: string,
  centerName: string,
  studentName: string,
  className: string,
  monthYear: string,
  sessionCount: number,
  rate: number,
  totalAmount: number,
  remainingDebt: number,
  bankName: string,
  bankAccount: string,
  accountHolder: string
): string {
  const [year, month] = monthYear.split('-');
  return `Kính gửi Quý phụ huynh học sinh ${studentName},
${centerName ? `[${centerName}] ` : ''}Thầy/Cô ${teacherName} xin gửi thông báo học phí tháng ${month}/${year}:
- Lớp: ${className}
- Số buổi học: ${sessionCount} buổi (Đơn giá: ${formatVND(rate)}/buổi)
- Tổng tiền tháng này: ${formatVND(totalAmount)}
${remainingDebt > 0 ? `- Số tiền cần thanh toán: ${formatVND(remainingDebt)}` : '- Đã hoàn tất học phí.'}

Thông tin chuyển khoản:
- Ngân hàng: ${bankName}
- Số tài khoản: ${bankAccount}
- Chủ tài khoản: ${accountHolder}
- Cú pháp CK: [${studentName} - ${className}]

Xin trân trọng cảm ơn sự đồng hành của Quý phụ huynh!`;
}
