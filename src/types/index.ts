export interface TeacherProfile {
  name: string;
  phone: string;
  email: string;
  centerName: string;
  address: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  noteTemplate: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  subject: string;
  grade: string;
  room?: string;
  defaultRate: number; // Đơn giá mỗi buổi mặc định (VND)
  scheduleInfo: string; // e.g. "T3, T5 (17:30 - 19:00)"
  color: string;
  archived?: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  customRate?: number; // Đơn giá riêng nếu khác đơn giá của lớp
  previousDebt: number; // Công nợ cũ từ các kỳ trước
  joinDate: string;
  status: 'active' | 'paused';
  notes?: string;
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'makeup';

export interface ClassSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title?: string;
  status: SessionStatus;
  note?: string;
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'makeup';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  isBilled: boolean; // Có tính phí buổi này không
  note?: string;
}

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';

export interface TuitionInvoice {
  id: string;
  invoiceCode: string; // e.g. "PT-202610-001"
  studentId: string;
  classId: string;
  monthYear: string; // e.g. "2026-10"
  studentName: string;
  className: string;
  parentName?: string;
  parentPhone?: string;
  
  sessionCount: number; // Số buổi tính phí
  ratePerSession: number; // Đơn giá/buổi
  subtotal: number; // sessionCount * ratePerSession
  previousDebt: number; // Nợ cũ
  adjustmentAmount: number; // Giảm trừ (âm) hoặc phụ phí (dương)
  adjustmentReason?: string;
  totalAmount: number; // subtotal + previousDebt + adjustmentAmount
  
  paidAmount: number; // Đã đóng
  remainingDebt: number; // Còn lại
  status: InvoiceStatus;
  
  attendedDates: string[]; // Danh sách các ngày học sinh đã tham dự
  notes?: string;
  createdAt: string;
  dueDate?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD HH:mm
  method: 'cash' | 'transfer';
  note?: string;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'classes' | 'schedule' | 'attendance' | 'tuition' | 'payments' | 'settings';
