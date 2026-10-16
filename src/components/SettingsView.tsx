import React, { useState } from 'react';
import { 
  Building, 
  User, 
  CreditCard, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy, 
  Cloud, 
  CloudOff, 
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  QrCode
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { 
  SupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../services/supabase';
import { 
  exportAllDataJSON, 
  importAllDataJSON, 
  resetToDemoData 
} from '../services/storage';

interface SettingsViewProps {
  teacher: TeacherProfile;
  supabaseConfig: SupabaseConfig;
  onSaveTeacher: (profile: TeacherProfile) => void;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
}

const COMMON_BANKS = [
  'Vietcombank',
  'MB Bank',
  'Techcombank',
  'VPBank',
  'ACB',
  'BIDV',
  'Agribank',
  'TPBank',
  'VIB',
  'Sacombank',
  'OCB',
  'MSB',
  'HDBank',
  'SeABank'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacher,
  supabaseConfig,
  onSaveTeacher,
  onUpdateSupabaseConfig
}) => {
  // Teacher profile state
  const [profile, setProfile] = useState<TeacherProfile>({ ...teacher });
  const [profileSaved, setProfileSaved] = useState(false);

  // Supabase state
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Backup & restore state
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTeacher(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleTestSupabase = async () => {
    setIsTestingSb(true);
    setSbTestResult(null);
    const result = await testSupabaseConnection(sbUrl, sbKey);
    setIsTestingSb(false);
    setSbTestResult(result);

    if (result.success) {
      onUpdateSupabaseConfig({
        url: sbUrl.trim(),
        anonKey: sbKey.trim(),
        connected: true,
        lastSync: new Date().toISOString(),
        autoSync: true
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduFee_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setBackupMsg('Đã tải xuống file sao lưu JSON thành công!');
    setTimeout(() => setBackupMsg(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importAllDataJSON(content);
      if (ok) {
        setBackupMsg('Khôi phục dữ liệu thành công! Ứng dụng sẽ tự động tải lại.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setBackupMsg('File không hợp lệ hoặc bị lỗi cú pháp JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu mẫu ban đầu?')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Cài đặt & Kết nối Supabase
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh thông tin giáo viên hiển thị trên phiếu thu, mã VietQR và đồng bộ đám mây Supabase
        </p>
      </div>

      {/* 1. Teacher Profile Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4169E1] flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Thông tin Giáo viên & Trung tâm
            </h2>
            <p className="text-[11px] text-slate-500">
              Thông tin này được in trực tiếp lên tiêu đề các Phiếu thu học phí
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Giáo viên *:
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Lớp học / Trung tâm *:
              </label>
              <input
                type="text"
                required
                value={profile.centerName}
                onChange={e => setProfile({ ...profile, centerName: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ:
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email:
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ giảng dạy:
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Bank Transfer Details for VietQR */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4169E1]">
              <QrCode className="w-4 h-4" />
              <span>Tài khoản Ngân hàng (Tự động sinh mã VietQR trên phiếu thu)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngân hàng:
                </label>
                <input
                  type="text"
                  list="bank-suggestions"
                  placeholder="Vietcombank, MB, Techcombank..."
                  value={profile.bankName}
                  onChange={e => setProfile({ ...profile, bankName: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
                <datalist id="bank-suggestions">
                  {COMMON_BANKS.map(b => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tài khoản nhận tiền:
                </label>
                <input
                  type="text"
                  placeholder="1029384756"
                  value={profile.bankAccount}
                  onChange={e => setProfile({ ...profile, bankAccount: e.target.value })}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ tài khoản (viết hoa):
                </label>
                <input
                  type="text"
                  placeholder="HOANG MINH THU"
                  value={profile.accountHolder}
                  onChange={e => setProfile({ ...profile, accountHolder: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú lời dặn học phí mặc định:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Kính mong Quý phụ huynh hoàn tất trước ngày 10 hàng tháng..."
                value={profile.noteTemplate}
                onChange={e => setProfile({ ...profile, noteTemplate: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Đã lưu thông tin giáo viên!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-[#3154C4] rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu thông tin giáo viên</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Supabase Integration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Đồng bộ & Lưu trữ Đám mây Supabase
              </h2>
              <p className="text-[11px] text-slate-500">
                Đồng bộ dữ liệu lâu dài giữa các thiết bị máy tính, điện thoại qua Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {supabaseConfig.connected ? (
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                Đã kết nối
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1">
                <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                Lưu cục bộ
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL:
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={sbUrl}
                onChange={e => setSbUrl(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon / Public Key:
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={sbKey}
                onChange={e => setSbKey(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-1 focus:ring-[#4169E1] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSb || !sbUrl || !sbKey}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isTestingSb ? 'Đang kiểm tra...' : 'Kiểm tra & Kết nối Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="text-xs font-semibold text-[#4169E1] hover:underline"
            >
              {showSqlSchema ? 'Ẩn mã tạo bảng SQL' : 'Xem mã SQL tạo bảng tự động cho Supabase'}
            </button>
          </div>

          {/* Test connection alert message */}
          {sbTestResult && (
            <div className={`p-3 rounded-xl text-xs font-medium border ${
              sbTestResult.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {sbTestResult.message}
            </div>
          )}

          {/* SQL Schema Box */}
          {showSqlSchema && (
            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  SQL Schema cho Supabase (Copy và dán vào Supabase SQL Editor):
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Đã sao chép' : 'Sao chép SQL'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono overflow-x-auto max-h-56 p-2 bg-black/40 rounded-lg text-slate-300 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 3. Backup & Restore Data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Sao lưu & Khôi phục Dữ liệu Cục bộ
            </h2>
            <p className="text-[11px] text-slate-500">
              Xuất hoặc nhập file JSON toàn bộ danh sách lớp, học sinh, điểm danh và phiếu thu
            </p>
          </div>
        </div>

        {backupMsg && (
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-semibold border border-blue-200">
            {backupMsg}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file sao lưu (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Khôi phục từ file JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại dữ liệu mẫu ban đầu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
