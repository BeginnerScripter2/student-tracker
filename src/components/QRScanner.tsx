import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export default function QRScanner() {
  const [reason, setReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [scannedStudentId, setScannedStudentId] = useState('');

  const handleScan = async (data: any) => {
    if (data) {
      const studentId = data.text;
      setScannedStudentId(studentId);

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const currentTime = new Date();
      
      // Check if student exists
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('qr_code', studentId)
        .single();

      if (!student) {
        toast.error('Student not found');
        return;
      }

      // Check if attendance already marked
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .gte('created_at', startOfDay.toISOString())
        .single();

      if (existingAttendance) {
        toast.error('Attendance already marked for today');
        return;
      }

      // Determine status based on time
      const schoolStartTime = new Date();
      schoolStartTime.setHours(8, 0, 0, 0);

      if (currentTime > schoolStartTime) {
        setShowReasonModal(true);
      } else {
        await markAttendance(student.id, 'present');
      }
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'tardy') => {
    try {
      const { error } = await supabase.from('attendance').insert([
        {
          student_id: studentId,
          status,
          reason: status === 'tardy' ? reason : null,
          date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      if (status === 'absent') {
        // Send email notification
        const { data: student } = await supabase
          .from('students')
          .select('parent_email')
          .eq('id', studentId)
          .single();

        if (student?.parent_email) {
          // In a real application, you would integrate with an email service here
          console.log(`Sending email to ${student.parent_email}: Hello, your son/daughter is absent`);
        }
      }

      toast.success(`Attendance marked as ${status}`);
      setShowReasonModal(false);
      setReason('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    toast.error('Error scanning QR code');
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold text-maroon-900 mb-4">Scan Student QR Code</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>

      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Student is Late</h3>
            <textarea
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter reason for being tardy..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-maroon-600 text-white rounded hover:bg-maroon-700"
                onClick={() => markAttendance(scannedStudentId, 'tardy')}
              >
                Mark as Tardy
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowReasonModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}