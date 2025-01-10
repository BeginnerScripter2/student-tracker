import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { supabase } from '../supabase';
import { Student, Attendance } from '../types';

export default function AttendanceReport() {
  const [attendanceData, setAttendanceData] = useState<(Attendance & { student: Student })[]>([]);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        student:students(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return;
    }

    setAttendanceData(data);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      attendanceData.map(record => ({
        Date: format(new Date(record.date), 'yyyy-MM-dd'),
        Time: format(new Date(record.created_at), 'HH:mm:ss'),
        'Student Name': `${record.student.first_name} ${record.student.last_name}`,
        Status: record.status,
        Reason: record.reason || '-'
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, 'attendance_report.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-maroon-900">Attendance Report</h2>
        <button
          onClick={exportToExcel}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Export to Excel
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-maroon-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.first_name} {record.student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                      record.status === 'tardy' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}