export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  parent_email: string;
  qr_code: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'tardy';
  reason?: string;
  created_at: string;
}