import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  Phone, 
  Coins, 
  Clock, 
  Filter, 
  Check, 
  CalendarDays,
  UserPlus,
  Building,
  AlertCircle
} from 'lucide-react';
import { ClassGroup, Student } from '../types';
import { formatVND } from '../utils/formatters';

interface ClassesAndStudentsViewProps {
  classes: ClassGroup[];
  students: Student[];
  onAddClass: () => void;
  onEditClass: (cls: ClassGroup) => void;
  onDeleteClass: (classId: string) => void;
  onAddStudent: (defaultClassId?: string) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onGoToAttendance: (classId: string) => void;
}

export const ClassesAndStudentsView: React.FC<ClassesAndStudentsViewProps> = ({
  classes,
  students,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onGoToAttendance
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchClass = selectedClassId === 'all' || student.classId === selectedClassId;
    const matchStatus = statusFilter === 'all' || student.status === statusFilter;
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchSearch = !cleanSearch || 
      student.name.toLowerCase().includes(cleanSearch) ||
      (student.phone && student.phone.includes(cleanSearch)) ||
      (student.parentName && student.parentName.toLowerCase().includes(cleanSearch)) ||
      (student.parentPhone && student.parentPhone.includes(cleanSearch));
    return matchClass && matchStatus && matchSearch;
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý Lớp học & Học sinh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách các nhóm lớp, mức học phí riêng cho từng học sinh và thông tin liên hệ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddStudent(selectedClassId !== 'all' ? selectedClassId : undefined)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#4169E1]" />
            <span>Thêm học sinh</span>
          </button>

          <button
            onClick={onAddClass}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo lớp học mới</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map(cls => {
          const classStudents = students.filter(s => s.classId === cls.id);
          const isSelected = selectedClassId === cls.id;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(isSelected ? 'all' : cls.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-blue-50/50 border-[#4169E1] shadow-xs ring-1 ring-[#4169E1]'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: cls.color || '#4169E1' }} 
                    />
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {cls.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{cls.subject}</span>
                    <span>·</span>
                    <span>{cls.grade}</span>
                    {cls.room && (
                      <>
                        <span>·</span>
                        <span>{cls.room}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEditClass(cls)}
                    title="Sửa lớp"
                    aria-label={`Sửa lớp ${cls.name}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClass(cls.id)}
                    title="Xóa lớp"
                    aria-label={`Xóa lớp ${cls.name}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Class Schedule & Rate Details */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[170px]">{cls.scheduleInfo || 'Linh hoạt'}</span>
                  </span>
                  <span className="font-bold text-[#4169E1] tabular-nums">
                    {formatVND(cls.defaultRate)}/b
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{classStudents.length}</strong> học sinh</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGoToAttendance(cls.id);
                    }}
                    className="text-xs font-semibold text-[#4169E1] hover:underline"
                  >
                    Lịch dạy & Điểm danh →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar for Students */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Danh sách Học sinh {selectedClass ? `— ${selectedClass.name}` : ''} ({filteredStudents.length})
            </h2>
            {selectedClassId !== 'all' && (
              <button
                onClick={() => setSelectedClassId('all')}
                className="text-xs text-[#4169E1] hover:underline font-medium"
              >
                (Xem tất cả lớp)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class Selector Dropdown */}
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
            >
              <option value="all">Tất cả lớp học</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="paused">Tạm dừng</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, phụ huynh..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#4169E1]"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-semibold">
                <th className="py-2.5 px-3">Học sinh</th>
                <th className="py-2.5 px-3">Lớp học</th>
                <th className="py-2.5 px-3">Phụ huynh & SĐT</th>
                <th className="py-2.5 px-3 text-right">Đơn giá / Buổi</th>
                <th className="py-2.5 px-3 text-right">Nợ cũ</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const cls = classes.find(c => c.id === student.classId);
                const effectiveRate = student.customRate ?? cls?.defaultRate ?? 0;
                const hasCustomRate = student.customRate !== undefined && student.customRate !== null && student.customRate !== cls?.defaultRate;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      {student.phone ? (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.phone}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Chưa có SĐT</div>
                      )}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">{cls?.name || 'Chưa gán'}</span>
                      {student.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {student.notes}
                        </div>
                      )}
                    </td>

                    {/* Parent Info */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{student.parentName || '—'}</div>
                      {student.parentPhone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.parentPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Rate per Session */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                      <div>{formatVND(effectiveRate)}</div>
                      {hasCustomRate && (
                        <div className="text-[10px] text-[#4169E1] font-semibold">
                          Giá riêng
                        </div>
                      )}
                    </td>

                    {/* Previous Debt */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {student.previousDebt > 0 ? (
                        <span className="font-bold text-amber-700">{formatVND(student.previousDebt)}</span>
                      ) : (
                        <span className="text-slate-400">0 ₫</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                        student.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEditStudent(student)}
                        aria-label={`Sửa học sinh ${student.name}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mr-1"
                        title="Sửa học sinh"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        aria-label={`Xóa học sinh ${student.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 text-sm mb-1">Chưa có học sinh nào trong danh sách</p>
                    <p className="text-slate-400 mb-3">Nhập danh sách học sinh thực tế để bắt đầu điểm danh và tính học phí</p>
                    <button
                      onClick={() => onAddStudent(selectedClassId !== 'all' ? selectedClassId : undefined)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Thêm học sinh vào lớp</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
