const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'luct_reporting'
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, role, name, faculty } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if user exists
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Insert user with plain text password
        const [result] = await connection.execute(
            'INSERT INTO users (email, password, role, name, faculty) VALUES (?, ?, ?, ?, ?)',
            [email, password, role, name, faculty]
        );
        
        connection.end();
        
        res.json({ 
            message: 'User registered successfully', 
            userId: result.insertId,
            user: {
                id: result.insertId,
                email,
                role,
                name,
                faculty
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        
        connection.end();
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                name: user.name,
                faculty: user.faculty
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                faculty: user.faculty
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute(
            'SELECT id, email, role, name, faculty, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        connection.end();
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit lecture report
app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
        const {
            class_id,
            week_of_reporting,
            date_of_lecture,
            actual_students_present,
            topic_taught,
            learning_outcomes,
            lecturer_recommendations
        } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            `INSERT INTO lecture_reports 
            (class_id, lecturer_id, week_of_reporting, date_of_lecture, actual_students_present, topic_taught, learning_outcomes, lecturer_recommendations) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [class_id, req.user.id, week_of_reporting, date_of_lecture, actual_students_present, topic_taught, learning_outcomes, lecturer_recommendations]
        );
        
        connection.end();
        
        res.json({ message: 'Report submitted successfully', reportId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get classes for lecturer
app.get('/api/classes', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        let query = `
            SELECT c.*, cr.course_code, cr.course_name 
            FROM classes c 
            JOIN courses cr ON c.course_id = cr.id
        `;
        let params = [];
        
        if (req.user.role === 'lecturer') {
            query += ' WHERE c.lecturer_id = ?';
            params = [req.user.id];
        }
        
        const [classes] = await connection.execute(query, params);
        connection.end();
        
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reports based on user role
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        let query = `
            SELECT lr.*, c.class_name, cr.course_code, cr.course_name, u.name as lecturer_name
            FROM lecture_reports lr
            JOIN classes c ON lr.class_id = c.id
            JOIN courses cr ON c.course_id = cr.id
            JOIN users u ON lr.lecturer_id = u.id
        `;
        
        let params = [];
        
        // Role-based filtering
        switch (req.user.role) {
            case 'lecturer':
                query += ' WHERE lr.lecturer_id = ?';
                params = [req.user.id];
                break;
            case 'student':
                // Students see reports from their classes
                query += ' WHERE c.id IN (SELECT class_id FROM student_classes WHERE student_id = ?)';
                params = [req.user.id];
                break;
            case 'principal_lecturer':
                // PRL sees reports from their faculty
                query += ' WHERE cr.faculty = ?';
                params = [req.user.faculty];
                break;
            // Program Leader and others see all reports
        }
        
        query += ' ORDER BY lr.created_at DESC';
        
        const [reports] = await connection.execute(query, params);
        connection.end();
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add feedback to report (PRL only)
app.post('/api/reports/:id/feedback', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'principal_lecturer') {
            return res.status(403).json({ error: 'Only Principal Lecturers can add feedback' });
        }
        
        const { feedback_text } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            'INSERT INTO feedback (report_id, principal_lecturer_id, feedback_text) VALUES (?, ?, ?)',
            [req.params.id, req.user.id, feedback_text]
        );
        
        connection.end();
        
        res.json({ message: 'Feedback added successfully', feedbackId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add rating (Students only)
app.post('/api/reports/:id/rating', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can add ratings' });
        }
        
        const { rating_value, comment } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        const [result] = await connection.execute(
            'INSERT INTO ratings (report_id, student_id, rating_value, comment) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, rating_value, comment]
        );
        
        connection.end();
        
        res.json({ message: 'Rating added successfully', ratingId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export reports to Excel
app.get('/api/export/reports', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [reports] = await connection.execute(`
            SELECT lr.*, c.class_name, cr.course_code, cr.course_name, u.name as lecturer_name
            FROM lecture_reports lr
            JOIN classes c ON lr.class_id = c.id
            JOIN courses cr ON c.course_id = cr.id
            JOIN users u ON lr.lecturer_id = u.id
            ORDER BY lr.created_at DESC
        `);
        
        connection.end();
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lecture Reports');
        
        // Add headers
        worksheet.columns = [
            { header: 'Report ID', key: 'id', width: 10 },
            { header: 'Class', key: 'class_name', width: 15 },
            { header: 'Course', key: 'course_name', width: 20 },
            { header: 'Lecturer', key: 'lecturer_name', width: 20 },
            { header: 'Week', key: 'week_of_reporting', width: 15 },
            { header: 'Date', key: 'date_of_lecture', width: 12 },
            { header: 'Students Present', key: 'actual_students_present', width: 15 },
            { header: 'Topic', key: 'topic_taught', width: 30 },
            { header: 'Learning Outcomes', key: 'learning_outcomes', width: 40 },
            { header: 'Recommendations', key: 'lecturer_recommendations', width: 40 }
        ];
        
        // Add data
        worksheet.addRows(reports);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=lecture-reports.xlsx');
        
        // Send file
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search functionality
app.get('/api/search', authenticateToken, async (req, res) => {
    try {
        const { q, type } = req.query;
        const connection = await mysql.createConnection(dbConfig);
        
        let query, params;
        
        switch (type) {
            case 'reports':
                query = `
                    SELECT lr.*, c.class_name, cr.course_name, u.name as lecturer_name
                    FROM lecture_reports lr
                    JOIN classes c ON lr.class_id = c.id
                    JOIN courses cr ON c.course_id = cr.id
                    JOIN users u ON lr.lecturer_id = u.id
                    WHERE lr.topic_taught LIKE ? OR cr.course_name LIKE ? OR u.name LIKE ?
                `;
                params = [`%${q}%`, `%${q}%`, `%${q}%`];
                break;
            case 'courses':
                query = 'SELECT * FROM courses WHERE course_code LIKE ? OR course_name LIKE ?';
                params = [`%${q}%`, `%${q}%`];
                break;
            case 'users':
                query = 'SELECT id, name, email, role, faculty FROM users WHERE name LIKE ? OR email LIKE ?';
                params = [`%${q}%`, `%${q}%`];
                break;
            default:
                query = `
                    SELECT lr.*, c.class_name, cr.course_name, u.name as lecturer_name
                    FROM lecture_reports lr
                    JOIN classes c ON lr.class_id = c.id
                    JOIN courses cr ON c.course_id = cr.id
                    JOIN users u ON lr.lecturer_id = u.id
                    WHERE lr.topic_taught LIKE ? OR cr.course_name LIKE ? OR u.name LIKE ?
                `;
                params = [`%${q}%`, `%${q}%`, `%${q}%`];
        }
        
        const [results] = await connection.execute(query, params);
        connection.end();
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});