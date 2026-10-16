import { TeacherProfile, ClassGroup, Student, ClassSession, AttendanceRecord, TuitionInvoice, PaymentRecord } from '../types';

export const initialTeacherProfile: TeacherProfile = {
  name: 'Trần Yến Thanh',
  phone: '',
  email: 'tranyenthanh.04.ct@gmail.com',
  centerName: 'Lớp học Cô Yến Thanh',
  address: '',
  bankName: 'Vietcombank',
  bankAccount: '',
  accountHolder: 'TRAN YEN THANH',
  noteTemplate: 'Kính mong Quý phụ huynh hoàn thành học phí theo thông báo. Chân thành cảm ơn!'
};

// Initial classes ready for teacher to use or modify
export const initialClasses: ClassGroup[] = [
  {
    id: 'class-1',
    name: 'Lớp 1',
    subject: 'Toán học',
    grade: 'Khối 9',
    room: 'Phòng học 1',
    defaultRate: 150000,
    scheduleInfo: 'Thứ 3, Thứ 5',
    color: '#4169E1',
    createdAt: '2026-10-01T08:00:00Z'
  }
];

// Không tạo ảo tên học sinh - để danh sách trống để giáo viên tự nhập học sinh thực tế của mình
export const initialStudents: Student[] = [];

export const initialSessions: ClassSession[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialInvoices: TuitionInvoice[] = [];

export const initialPayments: PaymentRecord[] = [];
