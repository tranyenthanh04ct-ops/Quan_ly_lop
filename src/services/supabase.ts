import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'edufee_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSync?: string;
  autoSync: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    url: '',
    anonKey: '',
    connected: false,
    autoSync: false
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;
  
  try {
    if (!cachedClient) {
      cachedClient = createClient(config.url, config.anonKey);
    }
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

/**
 * Test if the Supabase credentials are valid
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'Vui lòng điền đủ Supabase Project URL và Anon Key.' };
  }

  try {
    const testClient = createClient(url, anonKey);
    // Query a public auth or test endpoint
    const { error } = await testClient.auth.getSession();
    if (error && !error.message.includes('fetch')) {
      return { success: false, message: `Lỗi xác thực: ${error.message}` };
    }
    return { success: true, message: 'Kết nối Supabase thành công! Sẵn sàng đồng bộ dữ liệu.' };
  } catch (err: any) {
    return { success: false, message: `Không thể kết nối tới Supabase: ${err.message || 'Lỗi mạng'}` };
  }
}

/**
 * Recommended SQL schema for user to execute in Supabase SQL editor
 */
export const SUPABASE_SQL_SCHEMA = `-- EDUFEE - SCHEMA TỔNG HỢP CHO SUPABASE
-- Tạo các bảng lưu trữ cho Web App Quản Lý Lớp Học & Thu Học Phí

-- 1. Bảng Thông Tin Giáo Viên / Trung Tâm
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id TEXT PRIMARY KEY DEFAULT 'primary_teacher',
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  center_name TEXT,
  address TEXT,
  bank_name TEXT,
  bank_account TEXT,
  account_holder TEXT,
  note_template TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Nhóm Lớp Học
CREATE TABLE IF NOT EXISTS class_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  grade TEXT,
  room TEXT,
  default_rate NUMERIC DEFAULT 0,
  schedule_info TEXT,
  color TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Học Sinh
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES class_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  custom_rate NUMERIC,
  previous_debt NUMERIC DEFAULT 0,
  join_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Buổi Học (Lịch học)
CREATE TABLE IF NOT EXISTS class_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES class_groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  title TEXT,
  status TEXT DEFAULT 'scheduled',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Điểm Danh
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES class_groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present',
  is_billed BOOLEAN DEFAULT TRUE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Phiếu Thu Học Phí
CREATE TABLE IF NOT EXISTS tuition_invoices (
  id TEXT PRIMARY KEY,
  invoice_code TEXT NOT NULL,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES class_groups(id) ON DELETE SET NULL,
  month_year TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  session_count INT DEFAULT 0,
  rate_per_session NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  previous_debt NUMERIC DEFAULT 0,
  adjustment_amount NUMERIC DEFAULT 0,
  adjustment_reason TEXT,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  remaining_debt NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  attended_dates TEXT[],
  notes TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Lịch Sử Thanh Toán
CREATE TABLE IF NOT EXISTS payment_records (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES tuition_invoices(id) ON DELETE CASCADE,
  student_id TEXT,
  student_name TEXT,
  class_name TEXT,
  amount NUMERIC NOT NULL,
  payment_date TEXT NOT NULL,
  method TEXT DEFAULT 'transfer',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt Row Level Security (RLS) an toàn
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép đọc/ghi với anon key (hoặc auth user)
CREATE POLICY "Cho phép truy cập EduFee" ON teacher_profiles FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Lớp học" ON class_groups FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Học sinh" ON students FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Buổi học" ON class_sessions FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Điểm danh" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Phiếu thu" ON tuition_invoices FOR ALL USING (true);
CREATE POLICY "Cho phép truy cập Thanh toán" ON payment_records FOR ALL USING (true);
`;
