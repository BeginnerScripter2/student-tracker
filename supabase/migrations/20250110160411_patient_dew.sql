/*
  # Initial Schema Setup for Student Tracker

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `parent_email` (text)
      - `qr_code` (text, unique)
      - `created_at` (timestamp)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `date` (timestamp)
      - `status` (enum: present, absent, tardy)
      - `reason` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create enum type for attendance status
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'tardy');

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    parent_email text NOT NULL,
    qr_code text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE,
    date timestamptz NOT NULL,
    status attendance_status NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Allow authenticated users to read students"
    ON students
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert students"
    ON students
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policies for attendance table
CREATE POLICY "Allow authenticated users to read attendance"
    ON attendance
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert attendance"
    ON attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_qr_code ON students(qr_code);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);