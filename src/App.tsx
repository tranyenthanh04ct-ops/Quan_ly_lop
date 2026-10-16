import React, { useState, useEffect, useCallback } from 'react';
import { 
  ActiveTab, 
  TeacherProfile, 
  ClassGroup, 
  Student, 
  ClassSession, 
  AttendanceRecord, 
  TuitionInvoice, 
  PaymentRecord,
  SessionStatus
} from './types';
import { 
  getTeacherProfile, 
  saveTeacherProfile,
  getClasses, 
  addClass, 
  updateClass, 
  deleteClass,
  getStudents, 
  addStudent, 
  addBatchStudents,
  updateStudent, 
  deleteStudent,
  getSessions, 
  addSession, 
  addBatchSessions, 
  updateSession, 
  deleteSession,
  getAttendance, 
  batchMarkAttendance,
  getInvoices, 
  updateInvoice, 
  deleteInvoice, 
  autoGenerateInvoicesForMonth,
  getPayments, 
  recordPayment, 
  deletePayment,
  initStorage
} from './services/storage';
import { getSupabaseConfig, saveSupabaseConfig, SupabaseConfig } from './services/supabase';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClassesAndStudentsView } from './components/ClassesAndStudentsView';
import { ScheduleAndAttendanceView } from './components/ScheduleAndAttendanceView';
import { TuitionView } from './components/TuitionView';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { SettingsView } from './components/SettingsView';

import { ReceiptModal } from './components/ReceiptModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { ClassModal } from './components/ClassModal';
import { StudentModal } from './components/StudentModal';
import { SessionModal } from './components/SessionModal';
import { InvoiceEditModal } from './components/InvoiceEditModal';

export default function App() {
  // App navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Current working month (default to 2026-10 matching current system date)
  const [currentMonth, setCurrentMonth] = useState<string>('2026-10');

  // Core Data State
  const [teacher, setTeacher] = useState<TeacherProfile>(getTeacherProfile);
  const [classes, setClasses] = useState<ClassGroup[]>(getClasses);
  const [students, setStudents] = useState<Student[]>(getStudents);
  const [sessions, setSessions] = useState<ClassSession[]>(getSessions);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getAttendance);
  const [invoices, setInvoices] = useState<TuitionInvoice[]>(getInvoices);
  const [payments, setPayments] = useState<PaymentRecord[]>(getPayments);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig);

  // Modal States
  const [receiptInvoice, setReceiptInvoice] = useState<TuitionInvoice | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<TuitionInvoice | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [defaultStudentClassId, setDefaultStudentClassId] = useState<string | undefined>(undefined);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  const [isInvoiceEditOpen, setIsInvoiceEditOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<TuitionInvoice | null>(null);

  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<string | undefined>(undefined);

  // Refresh all state from localStorage
  const reloadData = useCallback(() => {
    setTeacher(getTeacherProfile());
    setClasses(getClasses());
    setStudents(getStudents());
    setSessions(getSessions());
    setAttendance(getAttendance());
    setInvoices(getInvoices());
    setPayments(getPayments());
    setSupabaseConfig(getSupabaseConfig());
  }, []);

  useEffect(() => {
    initStorage();
    reloadData();

    const handleDataUpdated = () => reloadData();
    window.addEventListener('edufee_data_updated', handleDataUpdated);
    return () => window.removeEventListener('edufee_data_updated', handleDataUpdated);
  }, [reloadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------- HANDLERS -----------------
  // Classes
  const handleSaveClass = (classData: Omit<ClassGroup, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      updateClass(id, classData);
      showToast('Đã cập nhật thông tin lớp học.');
    } else {
      addClass(classData);
      showToast('Đã tạo lớp học mới thành công!');
    }
  };

  const handleDeleteClass = (classId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lớp học này? Các học sinh thuộc lớp cũng cần được gán lại.')) {
      deleteClass(classId);
      showToast('Đã xóa lớp học.');
    }
  };

  // Students
  const handleSaveStudent = (studentData: Omit<Student, 'id'>, id?: string) => {
    if (id) {
      updateStudent(id, studentData);
      showToast('Đã cập nhật hồ sơ học sinh.');
    } else {
      addStudent(studentData);
      showToast('Đã thêm học sinh vào lớp!');
    }
  };

  const handleSaveBatchStudents = (studentsData: Omit<Student, 'id'>[]) => {
    addBatchStudents(studentsData);
    showToast(`Đã thêm ${studentsData.length} học sinh thực tế vào lớp thành công!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này khỏi hệ thống?')) {
      deleteStudent(studentId);
      showToast('Đã xóa học sinh.');
    }
  };

  // Sessions & Attendance
  const handleSaveSingleSession = (sessionData: Omit<ClassSession, 'id'>, id?: string) => {
    if (id) {
      updateSession(id, sessionData);
      showToast('Đã cập nhật buổi học.');
    } else {
      addSession(sessionData);
      showToast('Đã tạo buổi học mới.');
    }
  };

  const handleSaveBatchSessions = (batchList: Omit<ClassSession, 'id'>[]) => {
    addBatchSessions(batchList);
    showToast(`Đã tạo thành công ${batchList.length} buổi học định kỳ!`);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa buổi học này?')) {
      deleteSession(sessionId);
      showToast('Đã xóa buổi học.');
    }
  };

  const handleUpdateSessionStatus = (sessionId: string, status: SessionStatus) => {
    updateSession(sessionId, { status });
    showToast('Đã cập nhật trạng thái buổi học.');
  };

  const handleMarkAttendanceRecords = (records: AttendanceRecord[]) => {
    batchMarkAttendance(records);
    showToast('Đã lưu dữ liệu điểm danh.');
  };

  // Auto Calculate Invoices
  const handleAutoCalculate = (monthYear: string) => {
    const res = autoGenerateInvoicesForMonth(monthYear);
    showToast(`Đã tính học phí tháng ${monthYear.split('-')[1]}: Tạo mới ${res.created}, Cập nhật ${res.updated} phiếu.`);
    setActiveTab('tuition');
  };

  // Payment Recording
  const handleConfirmPayment = (invoiceId: string, amount: number, method: 'cash' | 'transfer', note?: string) => {
    recordPayment(invoiceId, amount, method, note);
    showToast(`Đã ghi nhận thu ${amount.toLocaleString('vi-VN')} ₫ thành công!`);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm('Bạn có chắc muốn hủy bản ghi thu tiền này? Số tiền sẽ được cộng lại vào công nợ của phiếu thu.')) {
      deletePayment(paymentId);
      showToast('Đã hủy giao dịch thanh toán.');
    }
  };

  // Edit Invoice
  const handleSaveInvoiceEdit = (id: string, updates: Partial<TuitionInvoice>) => {
    updateInvoice(id, updates);
    showToast('Đã cập nhật thông tin phiếu thu.');
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa phiếu thu này?')) {
      deleteInvoice(id);
      showToast('Đã xóa phiếu thu.');
    }
  };

  // Navigation shortcuts
  const handleOpenAttendanceForSession = (sessionId: string) => {
    setSelectedSessionForAttendance(sessionId);
    setActiveTab('schedule');
  };

  const handleOpenAddStudentFromClass = (classId?: string) => {
    setDefaultStudentClassId(classId);
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        teacher={teacher}
        supabaseConfig={supabaseConfig}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onQuickAttendance={() => setActiveTab('schedule')}
        onQuickRecordPayment={() => {
          setPaymentTargetInvoice(null);
          setIsPaymentModalOpen(true);
        }}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          teacher={teacher}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              teacher={teacher}
              classes={classes}
              students={students}
              sessions={sessions}
              invoices={invoices}
              currentMonth={currentMonth}
              onSelectTab={setActiveTab}
              onOpenAttendanceForSession={handleOpenAttendanceForSession}
              onOpenReceipt={(inv) => setReceiptInvoice(inv)}
              onOpenRecordPayment={(inv) => {
                setPaymentTargetInvoice(inv || null);
                setIsPaymentModalOpen(true);
              }}
              onOpenAddStudent={() => handleOpenAddStudentFromClass()}
              onOpenAddClass={() => {
                setEditingClass(null);
                setIsClassModalOpen(true);
              }}
              onAutoCalculateTuition={() => handleAutoCalculate(currentMonth)}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesAndStudentsView
              classes={classes}
              students={students}
              onAddClass={() => {
                setEditingClass(null);
                setIsClassModalOpen(true);
              }}
              onEditClass={(cls) => {
                setEditingClass(cls);
                setIsClassModalOpen(true);
              }}
              onDeleteClass={handleDeleteClass}
              onAddStudent={handleOpenAddStudentFromClass}
              onEditStudent={(st) => {
                setEditingStudent(st);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onGoToAttendance={(classId) => {
                setActiveTab('schedule');
              }}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleAndAttendanceView
              classes={classes}
              students={students}
              sessions={sessions}
              attendance={attendance}
              initialSelectedSessionId={selectedSessionForAttendance}
              onAddSession={() => {
                setEditingSession(null);
                setIsSessionModalOpen(true);
              }}
              onEditSession={(sess) => {
                setEditingSession(sess);
                setIsSessionModalOpen(true);
              }}
              onDeleteSession={handleDeleteSession}
              onMarkAttendance={handleMarkAttendanceRecords}
              onUpdateSessionStatus={handleUpdateSessionStatus}
            />
          )}

          {activeTab === 'tuition' && (
            <TuitionView
              invoices={invoices}
              classes={classes}
              students={students}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onAutoCalculate={handleAutoCalculate}
              onOpenReceipt={(inv) => setReceiptInvoice(inv)}
              onOpenRecordPayment={(inv) => {
                setPaymentTargetInvoice(inv);
                setIsPaymentModalOpen(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setIsInvoiceEditOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onCreateCustomInvoice={() => {
                handleAutoCalculate(currentMonth);
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentHistoryView
              payments={payments}
              invoices={invoices}
              onOpenReceipt={(inv) => setReceiptInvoice(inv)}
              onOpenRecordPayment={(inv) => {
                setPaymentTargetInvoice(inv || null);
                setIsPaymentModalOpen(true);
              }}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              teacher={teacher}
              supabaseConfig={supabaseConfig}
              onSaveTeacher={(prof) => {
                saveTeacherProfile(prof);
                setTeacher(prof);
                showToast('Đã lưu hồ sơ giáo viên thành công!');
              }}
              onUpdateSupabaseConfig={(cfg) => {
                saveSupabaseConfig(cfg);
                setSupabaseConfig(cfg);
                showToast('Đã cập nhật cấu hình Supabase!');
              }}
            />
          )}
        </main>
      </div>

      {/* ----------------- MODALS ----------------- */}
      {/* 1. Receipt Modal */}
      <ReceiptModal
        invoice={receiptInvoice}
        teacher={teacher}
        onClose={() => setReceiptInvoice(null)}
        onOpenRecordPayment={(inv) => {
          setPaymentTargetInvoice(inv);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* 2. Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetInvoice(null);
        }}
        invoices={invoices}
        initialInvoice={paymentTargetInvoice}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* 3. Class Creation / Edit Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        initialClass={editingClass}
        onSave={handleSaveClass}
      />

      {/* 4. Student Creation / Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        classes={classes}
        defaultClassId={defaultStudentClassId}
        initialStudent={editingStudent}
        onSave={handleSaveStudent}
        onBatchSave={handleSaveBatchStudents}
      />

      {/* 5. Session Modal */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
        classes={classes}
        initialSession={editingSession}
        onSaveSingle={handleSaveSingleSession}
        onSaveBatch={handleSaveBatchSessions}
      />

      {/* 6. Invoice Edit Modal */}
      <InvoiceEditModal
        isOpen={isInvoiceEditOpen}
        onClose={() => {
          setIsInvoiceEditOpen(false);
          setEditingInvoice(null);
        }}
        invoice={editingInvoice}
        onSave={handleSaveInvoiceEdit}
      />
    </div>
  );
}
