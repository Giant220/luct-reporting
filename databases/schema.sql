CREATE DATABASE IF NOT EXISTS luct_reporting;
USE luct_reporting;

-- Users table for all roles
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'principal_lecturer', 'program_leader') NOT NULL,
    name VARCHAR(255) NOT NULL,
    faculty VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    program_leader_id INT,
    faculty VARCHAR(255) NOT NULL,
    FOREIGN KEY (program_leader_id) REFERENCES users(id)
);

-- Classes table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(255) NOT NULL,
    course_id INT,
    lecturer_id INT,
    total_registered_students INT DEFAULT 0,
    venue VARCHAR(255),
    scheduled_time TIME,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Lecture reports table
CREATE TABLE lecture_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT,
    lecturer_id INT,
    week_of_reporting VARCHAR(50),
    date_of_lecture DATE,
    actual_students_present INT,
    topic_taught TEXT,
    learning_outcomes TEXT,
    lecturer_recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Feedback table
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    principal_lecturer_id INT,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES lecture_reports(id),
    FOREIGN KEY (principal_lecturer_id) REFERENCES users(id)
);

-- Ratings table
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    student_id INT,
    rating_value INT CHECK (rating_value >= 1 AND rating_value <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES lecture_reports(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Student classes enrollment
CREATE TABLE student_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    class_id INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE KEY unique_enrollment (student_id, class_id)
);

-- Insert preconfigured users with plain text passwords
INSERT INTO users (email, password, role, name, faculty) VALUES
('student@luct.com', 'student123', 'student', 'John Student', 'Computing'),
('lecturer@luct.com', 'lecturer123', 'lecturer', 'Dr. Smith', 'Computing'),
('prl@luct.com', 'prl123', 'principal_lecturer', 'Prof. Johnson', 'Computing'),
('pl@luct.com', 'pl123', 'program_leader', 'Dr. Wilson', 'Computing'),
('mary@luct.com', 'mary123', 'student', 'Mary Chen', 'Business'),
('robert@luct.com', 'robert123', 'lecturer', 'Dr. Robert Brown', 'Business');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, faculty) VALUES
('CS101', 'Introduction to Programming', 'Computing'),
('CS102', 'Database Systems', 'Computing'),
('BUS101', 'Business Management', 'Business'),
('MATH101', 'Calculus I', 'Mathematics');

-- Insert sample classes
INSERT INTO classes (class_name, course_id, lecturer_id, total_registered_students, venue, scheduled_time) VALUES
('CS101-A', 1, 2, 45, 'Room 101', '09:00:00'),
('CS102-B', 2, 2, 38, 'Room 102', '11:00:00'),
('BUS101-C', 3, 6, 52, 'Room 201', '14:00:00');

-- Enroll students in classes
INSERT INTO student_classes (student_id, class_id) VALUES
(1, 1), (1, 2), (5, 3);

-- Insert sample lecture reports
INSERT INTO lecture_reports (class_id, lecturer_id, week_of_reporting, date_of_lecture, actual_students_present, topic_taught, learning_outcomes, lecturer_recommendations) VALUES
(1, 2, 'Week 1', '2024-01-15', 42, 'Introduction to Programming Concepts', 'Understand basic programming syntax, Write simple programs, Debug code', 'More practice exercises needed'),
(2, 2, 'Week 2', '2024-01-22', 35, 'Database Design and Normalization', 'Design ER diagrams, Understand normalization forms, Create database schemas', 'Students struggling with normalization concepts'),
(3, 6, 'Week 1', '2024-01-16', 48, 'Business Fundamentals', 'Understand business structures, Learn management principles, Analyze case studies', 'Good participation, continue group discussions');