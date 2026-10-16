import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Check, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  ClassGroup, 
  Student, 
  ClassSession, 
  AttendanceRecord, 
  AttendanceStatus, 
  SessionStatus 
} from '../types';
import { formatDateVN, getDayOfWeekVN } from '../utils/formatters';

interface ScheduleAndAttendanceViewProps {
  classes: ClassGroup[];
  students: Student[];
  sessions: ClassSession[];
  attendance: AttendanceRecord[];
  initialSelectedSessionId?: string;
  onAddSession: () => void;
  onEditSession: (session: ClassSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onMarkAttendance: (records: AttendanceRecord[]) => void;
  onUpdateSessionStatus: (sessionId: string, status: SessionStatus) => void;
}

export const ScheduleAndAttendanceView: React.FC<ScheduleAndAttendanceViewProps> = ({
  classes,
  students,
  sessions,
  attendance,
  initialSelectedSessionId,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onMarkAttendance,
  onUpdateSessionStatus
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSelectedSessionId || (sessions.length > 0 ? sessions[0].id : null)
  );
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => {
        const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
        const matchMonth = !filterMonth || s.date.startsWith(filterMonth);
        return matchClass && matchMonth;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, selectedClassId, filterMonth]);

  // Current active session
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || filteredSessions[0] || null;
  }, [sessions, selectedSessionId, filteredSessions]);

  const currentClass = classes.find(c => c.id === currentSession?.classId);
  const classStudents = useMemo(() => {
    if (!currentSession) return [];
    return students.filter(s => s.classId === currentSession.classId && s.status === 'active');
  }, [students, currentSession]);

  // Local state for attendance records in current session
  const sessionAttendanceMap = useMemo(() => {
    if (!currentSession) return new Map<string, AttendanceRecord>();
    const sessionAtt = attendance.filter(a => a.sessionId === currentSession.id);
    return new Map(sessionAtt.map(a => [a.studentId, a]));
  }, [attendance, currentSession]);

  // Handle single student attendance change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!currentSession) return;
    const existing = sessionAttendanceMap.get(studentId);
    const isBilled = status === 'present' || status === 'makeup';

    const newRecord: AttendanceRecord = {
      id: existing?.id || `att-${Date.now()}-${studentId}`,
      sessionId: currentSession.id,
      studentId,
      classId: currentSession.classId,
      date: currentSession.date,
      status,
      isBilled: existing?.isBilled !== undefined ? existing.isBilled : isBilled,
      note: existing?.note || ''
    };

    onMarkAttendance([newRecord]);
  };

  const handleToggleBilled = (studentId: string) => {
    if (!currentSession) return;
    const existing = sessionAttendanceMap.get(studentId);
    const currentStatus = existing?.status || 'present';
    const currentBilled = existing?.isBilled !== undefined ? existing.isBilled : true;

    const newRecord: AttendanceRecord = {
      id: existing?.id || `att-${Date.now()}-${studentId}`,
      sessionId: currentSession.id,
      studentId,
      classId: currentSession.classId,
      date: currentSession.date,
      status: currentStatus,
      isBilled: !currentBilled,
      note: existing?.note || ''
    };

    onMarkAttendance([newRecord]);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    if (!currentSession) return;
    const existing = sessionAttendanceMap.get(studentId);
    const currentStatus = existing?.status || 'present';
    const isBilled = existing?.isBilled !== undefined ? existing.isBilled : true;

    const newRecord: AttendanceRecord = {
      id: existing?.id || `att-${Date.now()}-${studentId}`,
      sessionId: currentSession.id,
      studentId,
      classId: currentSession.classId,
      date: currentSession.date,
      status: currentStatus,
      isBilled,
      note
    };

    onMarkAttendance([newRecord]);
  };

  // One-click mark all present
  const handleMarkAllPresent = () => {
    if (!currentSession) return;
    const recordsToUpdate: AttendanceRecord[] = classStudents.map(student => {
      const existing = sessionAttendanceMap.get(student.id);
      return {
        id: existing?.id || `att-${Date.now()}-${student.id}`,
        sessionId: currentSession.id,
        studentId: student.id,
        classId: currentSession.classId,
        date: currentSession.date,
        status: 'present',
        isBilled: true,
        note: existing?.note || ''
      };
    });

    onMarkAttendance(recordsToUpdate);
    // Also mark session as completed if scheduled
    if (currentSession.status === 'scheduled') {
      onUpdateSessionStatus(currentSession.id, 'completed');
    }
  };

  // Stats for current session
  const stats = useMemo(() => {
    let present = 0;
    let absentExcused = 0;
    let absentUnexcused = 0;
    let makeup = 0;
    let billed = 0;

    classStudents.forEach(st => {
      const att = sessionAttendanceMap.get(st.id);
      const status = att?.status;
      if (status === 'present') present++;
      else if (status === 'absent_excused') absentExcused++;
      else if (status === 'absent_unexcused') absentUnexcused++;
      else if (status === 'makeup') makeup++;

      if (att?.isBilled) billed++;
    });

    return { present, absentExcused, absentUnexcused, makeup, billed, total: classStudents.length };
  }, [classStudents, sessionAttendanceMap]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Lịch dạy & Điểm danh buổi học
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý lịch học theo tuần/tháng và chấm điểm danh tự động tích lũy số buổi tính học phí
          </p>
        </div>

        <button
          onClick={onAddSession}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tạo lịch học / Buổi dạy</span>
        </button>
      </div>

      {/* Main 2-Column Split: Session List (Left) & Attendance Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sessions Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Danh sách buổi học ({filteredSessions.length})
            </h2>

            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Sessions List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredSessions.map(sess => {
              const cls = classes.find(c => c.id === sess.classId);
              const isSelected = currentSession?.id === sess.id;

              return (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#4169E1] ring-1 ring-[#4169E1] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: cls?.color || '#4169E1' }} 
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {cls?.name || 'Lớp'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{getDayOfWeekVN(sess.date)} {formatDateVN(sess.date)}</span>
                        <span>·</span>
                        <span>{sess.startTime} - {sess.endTime}</span>
                      </div>

                      {sess.title && (
                        <div className="text-[11px] text-slate-500 italic truncate max-w-[200px] mt-0.5">
                          {sess.title}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                      sess.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : sess.status === 'makeup'
                        ? 'bg-blue-50 text-blue-700'
                        : sess.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sess.status === 'completed' ? 'Đã học' : sess.status === 'makeup' ? 'Học bù' : sess.status === 'cancelled' ? 'Đã nghỉ' : 'Lên lịch'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <p className="text-slate-400">Không có buổi học nào trong tháng này.</p>
                <button
                  onClick={onAddSession}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tạo lịch học ngay</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Sheet (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          {currentSession ? (
            <>
              {/* Session Sheet Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: currentClass?.color || '#4169E1' }} 
                    />
                    <h2 className="text-base font-bold text-slate-900">
                      {currentClass?.name} — Điểm Danh
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {getDayOfWeekVN(currentSession.date)}, ngày {formatDateVN(currentSession.date)}
                    </span>
                    <span>·</span>
                    <span>{currentSession.startTime} - {currentSession.endTime}</span>
                    {currentSession.title && (
                      <>
                        <span>·</span>
                        <span className="text-[#4169E1] font-medium">{currentSession.title}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Session Status Selector */}
                  <select
                    value={currentSession.status}
                    onChange={e => onUpdateSessionStatus(currentSession.id, e.target.value as SessionStatus)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-hidden"
                  >
                    <option value="scheduled">Chưa dạy (Lên lịch)</option>
                    <option value="completed">Đã học (Hoàn tất)</option>
                    <option value="makeup">Buổi học bù</option>
                    <option value="cancelled">Nghỉ học</option>
                  </select>

                  <button
                    onClick={handleMarkAllPresent}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Tất cả có mặt</span>
                  </button>

                  <button
                    onClick={() => onEditSession(currentSession)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Chỉnh sửa buổi học"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSession(currentSession.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Xóa buổi học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Attendance Quick Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-1">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Sĩ số</div>
                  <div className="text-base font-bold text-slate-900 tabular-nums">{stats.total}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="text-[11px] text-emerald-700 font-semibold">Có mặt</div>
                  <div className="text-base font-bold text-emerald-700 tabular-nums">{stats.present}</div>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <div className="text-[11px] text-amber-700 font-semibold">Có phép</div>
                  <div className="text-base font-bold text-amber-700 tabular-nums">{stats.absentExcused}</div>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center">
                  <div className="text-[11px] text-rose-700 font-semibold">Không phép</div>
                  <div className="text-base font-bold text-rose-700 tabular-nums">{stats.absentUnexcused}</div>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-[11px] text-[#4169E1] font-semibold">Tính phí</div>
                  <div className="text-base font-bold text-[#4169E1] tabular-nums">{stats.billed}</div>
                </div>
              </div>

              {/* Attendance Student Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-semibold">
                      <th className="py-2.5 px-3">Học sinh</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái điểm danh</th>
                      <th className="py-2.5 px-3 text-center">Tính học phí</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map(student => {
                      const record = sessionAttendanceMap.get(student.id);
                      const currentStatus = record?.status;
                      const isBilled = record?.isBilled !== undefined ? record.isBilled : (currentStatus === 'present' || currentStatus === 'makeup');

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            {student.parentPhone && (
                              <div className="text-[11px] text-slate-400">PH: {student.parentPhone}</div>
                            )}
                          </td>

                          {/* Attendance Status Buttons */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Có mặt */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                Có mặt
                              </button>

                              {/* Vắng có phép */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'absent_excused')}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'absent_excused'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                              >
                                Có phép
                              </button>

                              {/* Vắng không phép */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'absent_unexcused')}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'absent_unexcused'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                Không phép
                              </button>

                              {/* Học bù */}
                              <button
                                onClick={() => handleStatusChange(student.id, 'makeup')}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'makeup'
                                    ? 'bg-[#4169E1] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#4169E1]'
                                }`}
                              >
                                Học bù
                              </button>
                            </div>
                          </td>

                          {/* Billable toggle */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isBilled}
                              onChange={() => handleToggleBilled(student.id)}
                              className="w-4 h-4 text-[#4169E1] rounded-md border-slate-300 focus:ring-0 cursor-pointer"
                              title="Tích chọn để tính phí buổi này vào phiếu thu"
                            />
                          </td>

                          {/* Notes */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              placeholder="Ghi chú buổi học..."
                              value={record?.note || ''}
                              onChange={e => handleNoteChange(student.id, e.target.value)}
                              className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-[#4169E1]"
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                          Lớp này chưa có học sinh nào. Hãy vào mục "Lớp học & Học sinh" để thêm học sinh.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Guidance */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Dữ liệu điểm danh được tự động lưu và cập nhật ngay vào bảng tính học phí.</span>
                <span className="font-semibold text-[#4169E1]">Đã đồng bộ</span>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Chưa chọn buổi học nào</p>
              <p className="text-xs text-slate-400 mt-1">Chọn một buổi học ở danh sách bên trái hoặc tạo buổi học mới</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
