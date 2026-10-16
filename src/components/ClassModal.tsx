import React, { useState, useEffect } from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { ClassGroup } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: ClassGroup | null;
  onSave: (classData: Omit<ClassGroup, 'id' | 'createdAt'>, id?: string) => void;
}

const COLOR_OPTIONS = [
  '#4169E1', // Royal Blue
  '#2563EB', // Blue
  '#1D4ED8', // Dark Blue
  '#0284C7', // Sky
  '#0D9488', // Teal
  '#16A34A', // Green
  '#7C3AED', // Violet
  '#D97706', // Amber
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  initialClass,
  onSave
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [room, setRoom] = useState('');
  const [defaultRate, setDefaultRate] = useState<number>(150000);
  const [scheduleInfo, setScheduleInfo] = useState('');
  const [color, setColor] = useState('#4169E1');

  useEffect(() => {
    if (initialClass) {
      setName(initialClass.name);
      setSubject(initialClass.subject);
      setGrade(initialClass.grade);
      setRoom(initialClass.room || '');
      setDefaultRate(initialClass.defaultRate);
      setScheduleInfo(initialClass.scheduleInfo);
      setColor(initialClass.color || '#4169E1');
    } else {
      setName('');
      setSubject('');
      setGrade('');
      setRoom('');
      setDefaultRate(150000);
      setScheduleInfo('');
      setColor('#4169E1');
    }
  }, [initialClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      room: room.trim(),
      defaultRate: Number(defaultRate) || 0,
      scheduleInfo: scheduleInfo.trim(),
      color
    }, initialClass?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4169E1] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialClass ? 'Chỉnh sửa Lớp học' : 'Tạo Nhóm / Lớp học mới'}
              </h3>
              <p className="text-[11px] text-slate-500">Cấu hình môn học, lịch cố định và đơn giá mặc định</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên lớp học *:
            </label>
            <input
              type="text"
              required
              placeholder="Nhập tên lớp học"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Môn học:
              </label>
              <input
                type="text"
                placeholder="Toán, Tiếng Anh, Văn..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối / Cấp lớp:
              </label>
              <input
                type="text"
                placeholder="Lớp 9, Lớp 12..."
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn giá mặc định / Buổi (VNĐ) *:
              </label>
              <input
                type="number"
                step={5000}
                required
                value={defaultRate}
                onChange={e => setDefaultRate(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phòng học / Địa điểm:
              </label>
              <input
                type="text"
                placeholder="Phòng 201, Tầng 2..."
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lịch học cố định (mô tả):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Thứ 3, Thứ 5 (17:30 - 19:30)"
              value={scheduleInfo}
              onChange={e => setScheduleInfo(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
            />
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Màu đại diện lớp:
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              <span>{initialClass ? 'Cập nhật lớp' : 'Tạo lớp ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
