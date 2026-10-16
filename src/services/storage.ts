import { 
  TeacherProfile, 
  ClassGroup, 
  Student, 
  ClassSession, 
  AttendanceRecord, 
  TuitionInvoice, 
  PaymentRecord 
} from '../types';
import { 
  initialTeacherProfile, 
  initialClasses, 
  initialStudents, 
  initialSessions, 
  initialAttendance, 
  initialInvoices, 
  initialPayments 
} from '../data/mockData';
import { generateInvoiceCode } from '../utils/formatters';

const STORAGE_KEYS = {
  TEACHER: 'edufee_teacher_profile',
  CLASSES: 'edufee_classes',
  STUDENTS: 'edufee_students',
  SESSIONS: 'edufee_sessions',
  ATTENDANCE: 'edufee_attendance',
  INVOICES: 'edufee_invoices',
  PAYMENTS: 'edufee_payments',
  INITIALIZED: 'edufee_initialized_real_v4'
};

// Dispatch custom event to notify listeners
function notifyDataChanged() {
  window.dispatchEvent(new Event('edufee_data_updated'));
}

export function initStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(initialTeacherProfile));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// ----------------- TEACHER PROFILE -----------------
export function getTeacherProfile(): TeacherProfile {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER);
    return raw ? JSON.parse(raw) : initialTeacherProfile;
  } catch {
    return initialTeacherProfile;
  }
}

export function saveTeacherProfile(profile: TeacherProfile): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(profile));
  notifyDataChanged();
}

// ----------------- CLASSES -----------------
export function getClasses(): ClassGroup[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : initialClasses;
  } catch {
    return initialClasses;
  }
}

export function addClass(classData: Omit<ClassGroup, 'id' | 'createdAt'>): ClassGroup {
  const list = getClasses();
  const newClass: ClassGroup = {
    ...classData,
    id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  list.push(newClass);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  notifyDataChanged();
  return newClass;
}

export function updateClass(id: string, updates: Partial<ClassGroup>): void {
  const list = getClasses().map(c => c.id === id ? { ...c, ...updates } : c);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  notifyDataChanged();
}

export function deleteClass(id: string): void {
  const list = getClasses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  notifyDataChanged();
}

// ----------------- STUDENTS -----------------
export function getStudents(classId?: string): Student[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const list: Student[] = raw ? JSON.parse(raw) : initialStudents;
    return classId ? list.filter(s => s.classId === classId) : list;
  } catch {
    return initialStudents;
  }
}

export function addStudent(studentData: Omit<Student, 'id'>): Student {
  const list = getStudents();
  const newStudent: Student = {
    ...studentData,
    id: `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  };
  list.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  notifyDataChanged();
  return newStudent;
}

export function addBatchStudents(studentsData: Omit<Student, 'id'>[]): Student[] {
  const list = getStudents();
  const added: Student[] = studentsData.map((s, idx) => ({
    ...s,
    id: `stu-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`
  }));
  const updated = [...list, ...added];
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  notifyDataChanged();
  return added;
}

export function updateStudent(id: string, updates: Partial<Student>): void {
  const list = getStudents().map(s => s.id === id ? { ...s, ...updates } : s);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  notifyDataChanged();
}

export function deleteStudent(id: string): void {
  const list = getStudents().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  notifyDataChanged();
}

// ----------------- SESSIONS -----------------
export function getSessions(classId?: string): ClassSession[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const list: ClassSession[] = raw ? JSON.parse(raw) : initialSessions;
    return classId ? list.filter(s => s.classId === classId) : list;
  } catch {
    return initialSessions;
  }
}

export function addSession(sessionData: Omit<ClassSession, 'id'>): ClassSession {
  const list = getSessions();
  const newSession: ClassSession = {
    ...sessionData,
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  };
  list.push(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  notifyDataChanged();
  return newSession;
}

export function addBatchSessions(sessions: Omit<ClassSession, 'id'>[]): void {
  const list = getSessions();
  const newBatch = sessions.map((s, idx) => ({
    ...s,
    id: `sess-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`
  }));
  const updated = [...list, ...newBatch];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  notifyDataChanged();
}

export function updateSession(id: string, updates: Partial<ClassSession>): void {
  const list = getSessions().map(s => s.id === id ? { ...s, ...updates } : s);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  notifyDataChanged();
}

export function deleteSession(id: string): void {
  const list = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
  // Also clean up attendance for this session
  const attList = getAttendance().filter(a => a.sessionId !== id);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attList));
  notifyDataChanged();
}

// ----------------- ATTENDANCE -----------------
export function getAttendance(sessionId?: string): AttendanceRecord[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const list: AttendanceRecord[] = raw ? JSON.parse(raw) : initialAttendance;
    return sessionId ? list.filter(a => a.sessionId === sessionId) : list;
  } catch {
    return initialAttendance;
  }
}

export function markAttendance(
  sessionId: string,
  studentId: string,
  classId: string,
  date: string,
  status: AttendanceRecord['status'],
  isBilled: boolean = true,
  note?: string
): AttendanceRecord {
  const list = getAttendance();
  const existingIdx = list.findIndex(a => a.sessionId === sessionId && a.studentId === studentId);
  
  const record: AttendanceRecord = {
    id: existingIdx >= 0 ? list[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId,
    studentId,
    classId,
    date,
    status,
    isBilled,
    note
  };

  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.push(record);
  }

  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(list));
  notifyDataChanged();
  return record;
}

export function batchMarkAttendance(records: AttendanceRecord[]): void {
  const currentList = getAttendance();
  const recordMap = new Map(currentList.map(a => [`${a.sessionId}_${a.studentId}`, a]));

  for (const r of records) {
    recordMap.set(`${r.sessionId}_${r.studentId}`, r);
  }

  const updated = Array.from(recordMap.values());
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
  notifyDataChanged();
}

// ----------------- INVOICES -----------------
export function getInvoices(monthYear?: string): TuitionInvoice[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const list: TuitionInvoice[] = raw ? JSON.parse(raw) : initialInvoices;
    return monthYear ? list.filter(i => i.monthYear === monthYear) : list;
  } catch {
    return initialInvoices;
  }
}

export function createInvoice(invoiceData: Omit<TuitionInvoice, 'id' | 'createdAt'>): TuitionInvoice {
  const list = getInvoices();
  const newInv: TuitionInvoice = {
    ...invoiceData,
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };
  list.push(newInv);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
  notifyDataChanged();
  return newInv;
}

export function updateInvoice(id: string, updates: Partial<TuitionInvoice>): void {
  const list = getInvoices().map(i => {
    if (i.id === id) {
      const merged = { ...i, ...updates };
      // Recalculate remainingDebt and status if financial values changed
      const total = merged.subtotal + merged.previousDebt + merged.adjustmentAmount;
      const remaining = Math.max(0, total - merged.paidAmount);
      let status: TuitionInvoice['status'] = 'unpaid';
      if (merged.paidAmount >= total && total > 0) {
        status = 'paid';
      } else if (merged.paidAmount > 0) {
        status = 'partial';
      }
      return {
        ...merged,
        totalAmount: total,
        remainingDebt: remaining,
        status: updates.status || status
      };
    }
    return i;
  });
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
  notifyDataChanged();
}

export function deleteInvoice(id: string): void {
  const list = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
  notifyDataChanged();
}

/**
 * Automatically calculate and generate invoices for all students in monthYear (YYYY-MM)
 */
export function autoGenerateInvoicesForMonth(monthYear: string): { created: number; updated: number } {
  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();
  const classMap = new Map(classes.map(c => [c.id, c]));
  const existingInvoices = getInvoices(monthYear);
  const existingMap = new Map(existingInvoices.map(i => [i.studentId, i]));

  const allAttendance = getAttendance();
  let createdCount = 0;
  let updatedCount = 0;

  let seqCounter = existingInvoices.length + 1;

  for (const student of students) {
    const cls = classMap.get(student.classId);
    if (!cls) continue;

    // Filter attendance records for this student in this month where date starts with monthYear
    const studentMonthAtt = allAttendance.filter(a => 
      a.studentId === student.id &&
      a.date.startsWith(monthYear) &&
      a.isBilled &&
      (a.status === 'present' || a.status === 'makeup')
    );

    const attendedDates = studentMonthAtt
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(a => {
        const parts = a.date.split('-');
        const dateFmt = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : a.date;
        return a.status === 'makeup' ? `${dateFmt} (Học bù)` : dateFmt;
      });

    const sessionCount = studentMonthAtt.length;
    const ratePerSession = student.customRate ?? cls.defaultRate;
    const subtotal = sessionCount * ratePerSession;
    const previousDebt = student.previousDebt || 0;

    const existing = existingMap.get(student.id);

    if (existing) {
      // Update session count and subtotal if existing
      const totalAmount = subtotal + previousDebt + existing.adjustmentAmount;
      const remainingDebt = Math.max(0, totalAmount - existing.paidAmount);
      let status: TuitionInvoice['status'] = 'unpaid';
      if (existing.paidAmount >= totalAmount && totalAmount > 0) {
        status = 'paid';
      } else if (existing.paidAmount > 0) {
        status = 'partial';
      }

      updateInvoice(existing.id, {
        sessionCount,
        ratePerSession,
        subtotal,
        totalAmount,
        remainingDebt,
        status,
        attendedDates,
        studentName: student.name,
        className: cls.name,
        parentName: student.parentName,
        parentPhone: student.parentPhone
      });
      updatedCount++;
    } else {
      // Create new invoice
      const adjustmentAmount = 0;
      const totalAmount = subtotal + previousDebt + adjustmentAmount;
      const paidAmount = 0;
      const remainingDebt = totalAmount;

      createInvoice({
        invoiceCode: generateInvoiceCode(monthYear, seqCounter++),
        studentId: student.id,
        classId: student.classId,
        monthYear,
        studentName: student.name,
        className: cls.name,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        sessionCount,
        ratePerSession,
        subtotal,
        previousDebt,
        adjustmentAmount,
        totalAmount,
        paidAmount,
        remainingDebt,
        status: 'unpaid',
        attendedDates,
        dueDate: `${monthYear}-25`,
        notes: `Phiếu thu học phí tháng ${monthYear.split('-')[1]}/${monthYear.split('-')[0]}`
      });
      createdCount++;
    }
  }

  notifyDataChanged();
  return { created: createdCount, updated: updatedCount };
}

// ----------------- PAYMENTS -----------------
export function getPayments(): PaymentRecord[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : initialPayments;
  } catch {
    return initialPayments;
  }
}

export function recordPayment(
  invoiceId: string,
  amount: number,
  method: 'cash' | 'transfer',
  note?: string
): PaymentRecord {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) throw new Error('Không tìm thấy phiếu thu');

  const payments = getPayments();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    invoiceId,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    className: invoice.className,
    amount,
    paymentDate: dateStr,
    method,
    note,
    createdAt: now.toISOString()
  };

  payments.unshift(paymentRecord);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

  // Update invoice paid amount
  const newPaidAmount = invoice.paidAmount + amount;
  const newRemainingDebt = Math.max(0, invoice.totalAmount - newPaidAmount);
  let newStatus: TuitionInvoice['status'] = 'unpaid';
  if (newPaidAmount >= invoice.totalAmount && invoice.totalAmount > 0) {
    newStatus = 'paid';
  } else if (newPaidAmount > 0) {
    newStatus = 'partial';
  }

  updateInvoice(invoice.id, {
    paidAmount: newPaidAmount,
    remainingDebt: newRemainingDebt,
    status: newStatus
  });

  notifyDataChanged();
  return paymentRecord;
}

export function deletePayment(id: string): void {
  const payments = getPayments();
  const payment = payments.find(p => p.id === id);
  if (!payment) return;

  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === payment.invoiceId);
  if (invoice) {
    const newPaid = Math.max(0, invoice.paidAmount - payment.amount);
    const newRemaining = Math.max(0, invoice.totalAmount - newPaid);
    let status: TuitionInvoice['status'] = 'unpaid';
    if (newPaid >= invoice.totalAmount && invoice.totalAmount > 0) {
      status = 'paid';
    } else if (newPaid > 0) {
      status = 'partial';
    }
    updateInvoice(invoice.id, {
      paidAmount: newPaid,
      remainingDebt: newRemaining,
      status
    });
  }

  const updated = payments.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
  notifyDataChanged();
}

// ----------------- BACKUP / RESTORE / RESET -----------------
export function exportAllDataJSON(): string {
  initStorage();
  const fullBackup = {
    teacher: getTeacherProfile(),
    classes: getClasses(),
    students: getStudents(),
    sessions: getSessions(),
    attendance: getAttendance(),
    invoices: getInvoices(),
    payments: getPayments(),
    exportedAt: new Date().toISOString(),
    version: '2.0'
  };
  return JSON.stringify(fullBackup, null, 2);
}

export function importAllDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;

    if (parsed.teacher) localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(parsed.teacher));
    if (parsed.classes) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(parsed.classes));
    if (parsed.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
    if (parsed.sessions) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(parsed.sessions));
    if (parsed.attendance) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(parsed.attendance));
    if (parsed.invoices) localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(parsed.invoices));
    if (parsed.payments) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(parsed.payments));

    notifyDataChanged();
    return true;
  } catch {
    return false;
  }
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(initialTeacherProfile));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
  notifyDataChanged();
}
