import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, ListPlus } from 'lucide-react';
import { Student, ClassGroup } from '../types';
import { formatVND } from '../utils/formatters';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  defaultClassId?: string;
  initialStudent?: Student | null;
  onSave: (studentData: Omit<Student, 'id'>, id?: string) => void;
  onBatchSave?: (studentsData: Omit<Student, 'id'>[]) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  defaultClassId,
  initialStudent,
  onSave,
  onBatchSave
}) => {
  const [tab, setTab] = useState<'single' | 'batch'>('single');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customRate, setCustomRate] = useState<string>('');
  const [previousDebt, setPreviousDebt] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [notes, setNotes] = useState('');

  // Batch import text
  const [batchText, setBatchText] = useState('');

  useEffect(() => {
    if (initialStudent) {
      setTab('single');
      setName(initialStudent.name);
      setClassId(initialStudent.classId);
      setPhone(initialStudent.phone || '');
      setParentName(initialStudent.parentName || '');
      setParentPhone(initialStudent.parentPhone || '');
      setAddress(initialStudent.address || '');
      setCustomRate(initialStudent.customRate !== undefined && initialStudent.customRate !== null ? String(initialStudent.customRate) : '');
      setPreviousDebt(initialStudent.previousDebt || 0);
      setStatus(initialStudent.status);
      setNotes(initialStudent.notes || '');
    } else {
      setName('');
      setClassId(defaultClassId || (classes.length > 0 ? classes[0].id : ''));
      setPhone('');
      setParentName('');
      setParentPhone('');
      setAddress('');
      setCustomRate('');
      setPreviousDebt(0);
      setStatus('active');
      setNotes('');
      setBatchText('');
    }
  }, [initialStudent, defaultClassId, classes, isOpen]);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === classId);

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !classId) return;

    onSave({
      name: name.trim(),
      classId,
      phone: phone.trim() || undefined,
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      address: address.trim() || undefined,
      customRate: customRate !== '' ? Number(customRate) : undefined,
      previousDebt: Number(previousDebt) || 0,
      joinDate: initialStudent ? initialStudent.joinDate : new Date().toISOString().split('T')[0],
      status,
      notes: notes.trim() || undefined
    }, initialStudent?.id);

    onClose();
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !batchText.trim()) return;

    const lines = batchText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsedStudents: Omit<Student, 'id'>[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const line of lines) {
      // Allow format: "Nguyen Van A - 0912345678" or "Nguyen Van A, 0912345678" or just "Nguyen Van A"
      let studentName = line;
      let studentPhone: string | undefined = undefined;

      if (line.includes('-')) {
        const parts = line.split('-');
        studentName = parts[0].trim();
        studentPhone = parts.slice(1).join('-').trim();
      } else if (line.includes(',')) {
        const parts = line.split(',');
        studentName = parts[0].trim();
        studentPhone = parts.slice(1).join(',').trim();
      }

      if (studentName) {
        parsedStudents.push({
          name: studentName,
          classId,
          phone: studentPhone,
          previousDebt: 0,
          joinDate: today,
          status: 'active'
        });
      }
    }

    if (parsedStudents.length > 0 && onBatchSave) {
      onBatchSave(parsedStudents);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4169E1] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialStudent ? 'Chỉnh sửa thông tin Học sinh' : 'Thêm Học sinh thực tế vào lớp'}
              </h3>
              <p className="text-[11px] text-slate-500">Nhập thông tin học sinh thực tế của bạn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle for New Student (Single vs Batch Import) */}
        {!initialStudent && onBatchSave && (
          <div className="px-5 pt-3">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTab('single')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập từng học sinh
              </button>
              <button
                type="button"
                onClick={() => setTab('batch')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  tab === 'batch'
                    ? 'bg-white text-[#4169E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Dán danh sách nhiều bạn</span>
              </button>
            </div>
          </div>
        )}

        {/* Single Student Form */}
        {tab === 'single' ? (
          <form onSubmit={handleSubmitSingle} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
            {/* Student Name & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên học sinh"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp học *:
                </label>
                <select
                  required
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatVND(c.defaultRate)}/b)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Phone & Parent Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SĐT học sinh:
                </label>
                <input
                  type="text"
                  placeholder="SĐT học sinh"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ tên Phụ huynh:
                </label>
                <input
                  type="text"
                  placeholder="Tên bố/mẹ..."
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SĐT Phụ huynh:
                </label>
                <input
                  type="text"
                  placeholder="SĐT phụ huynh"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Custom Tuition Rate & Previous Debt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học phí riêng / Buổi (VNĐ):
                </label>
                <input
                  type="number"
                  step={5000}
                  placeholder={currentClass ? `Mặc định lớp: ${formatVND(currentClass.defaultRate)}` : 'Để trống dùng giá lớp'}
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {customRate !== '' 
                    ? `Áp dụng riêng: ${formatVND(Number(customRate))}/buổi` 
                    : `Theo giá lớp: ${formatVND(currentClass?.defaultRate || 0)}/buổi`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nợ cũ chuyển sang (VNĐ):
                </label>
                <input
                  type="number"
                  step={10000}
                  value={previousDebt}
                  onChange={e => setPreviousDebt(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nợ kỳ trước nếu có
                </span>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái:
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                >
                  <option value="active">Đang theo học</option>
                  <option value="paused">Tạm dừng học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trường học / Địa chỉ:
                </label>
                <input
                  type="text"
                  placeholder="Trường đang học..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú học tập:
              </label>
              <input
                type="text"
                placeholder="Ghi chú thêm..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            {/* Buttons */}
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
                <span>{initialStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Batch Import Form */
          <form onSubmit={handleBatchSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thêm vào lớp *:
              </label>
              <select
                required
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dán danh sách học sinh (mỗi bạn 1 dòng) *:
              </label>
              <textarea
                rows={6}
                required
                placeholder="Dán danh sách từ Word, Excel hoặc Zalo, ví dụ:&#10;Trần Quốc Tuấn - 0988111222&#10;Lê Hải My - 0912333444&#10;Nguyễn Bảo Ngọc"
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Hệ thống tự động tách tên và số điện thoại trên từng dòng.
              </span>
            </div>

            {/* Buttons */}
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
                <span>Thêm cả danh sách</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
