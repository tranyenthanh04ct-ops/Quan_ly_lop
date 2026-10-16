import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Check, Sparkles } from 'lucide-react';
import { ClassSession, ClassGroup, SessionStatus } from '../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  initialSession?: ClassSession | null;
  onSaveSingle: (session: Omit<ClassSession, 'id'>, id?: string) => void;
  onSaveBatch: (sessions: Omit<ClassSession, 'id'>[]) => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  classes,
  initialSession,
  onSaveSingle,
  onSaveBatch
}) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [classId, setClassId] = useState('');
  
  // Single session state
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:30');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<SessionStatus>('scheduled');
  const [note, setNote] = useState('');

  // Batch recurring state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([2, 4]); // 2: Tuesday, 4: Thursday

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (initialSession) {
      setMode('single');
      setClassId(initialSession.classId);
      setDate(initialSession.date);
      setStartTime(initialSession.startTime);
      setEndTime(initialSession.endTime);
      setTitle(initialSession.title || '');
      setStatus(initialSession.status);
      setNote(initialSession.note || '');
    } else {
      setClassId(classes.length > 0 ? classes[0].id : '');
      setDate(today);
      setStartDate(today);
      // default end date: end of current month
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setEndDate(lastDay);
      setStartTime('17:30');
      setEndTime('19:30');
      setTitle('');
      setStatus('scheduled');
      setNote('');
    }
  }, [initialSession, classes, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !date) return;

    onSaveSingle({
      classId,
      date,
      startTime,
      endTime,
      title: title.trim() || undefined,
      status,
      note: note.trim() || undefined
    }, initialSession?.id);

    onClose();
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !startDate || !endDate || selectedDays.length === 0) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const generated: Omit<ClassSession, 'id'>[] = [];

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        const dStr = current.toISOString().split('T')[0];
        generated.push({
          classId,
          date: dStr,
          startTime,
          endTime,
          title: title.trim() || 'Buổi học định kỳ',
          status: 'scheduled',
          note: note.trim() || undefined
        });
      }
      current.setDate(current.getDate() + 1);
    }

    if (generated.length > 0) {
      onSaveBatch(generated);
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
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialSession ? 'Chỉnh sửa Buổi học' : 'Tạo Lịch học mới'}
              </h3>
              <p className="text-[11px] text-slate-500">Thiết lập buổi học đơn lẻ hoặc lịch lặp định kỳ theo tuần</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector (only when creating new) */}
        {!initialSession && (
          <div className="px-5 pt-3">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Buổi học đơn lẻ
              </button>
              <button
                type="button"
                onClick={() => setMode('batch')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  mode === 'batch'
                    ? 'bg-white text-[#4169E1] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo lịch định kỳ lặp lại</span>
              </button>
            </div>
          </div>
        )}

        {/* Single Session Form */}
        {mode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lớp học *:
              </label>
              <select
                required
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày học *:
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bắt đầu:
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kết thúc:
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề / Bài học:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bất đẳng thức Cauchy, Luyện đề..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái buổi học:
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                >
                  <option value="scheduled">Đã lên lịch (Chưa dạy)</option>
                  <option value="completed">Đã học (Hoàn thành)</option>
                  <option value="makeup">Buổi học bù</option>
                  <option value="cancelled">Nghỉ học</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú nội bộ:
              </label>
              <input
                type="text"
                placeholder="Ghi chú thêm về buổi học..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            {/* Actions */}
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
                <span>{initialSession ? 'Cập nhật' : 'Tạo buổi học'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Batch Generator Form */
          <form onSubmit={handleBatchSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lớp học *:
              </label>
              <select
                required
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Days of week checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Các thứ trong tuần lặp lại *:
              </label>
              <div className="grid grid-cols-7 gap-1">
                {[
                  { day: 1, label: 'T2' },
                  { day: 2, label: 'T3' },
                  { day: 3, label: 'T4' },
                  { day: 4, label: 'T5' },
                  { day: 5, label: 'T6' },
                  { day: 6, label: 'T7' },
                  { day: 0, label: 'CN' }
                ].map(item => {
                  const active = selectedDays.includes(item.day);
                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => toggleDay(item.day)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        active
                          ? 'bg-[#4169E1] text-white border-[#4169E1] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giờ bắt đầu:
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giờ kết thúc:
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề chung cho các buổi:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Buổi học định kỳ..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            {/* Actions */}
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
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo lịch định kỳ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
