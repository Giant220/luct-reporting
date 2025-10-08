import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Set base URL for API
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://luct-backend-ddza.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', type: 'Major', credits: '', faculty: 'Faculty of ICT (FICT)' });
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Sotho names and courses data - Updated with FICT
  const sothoData = {
    lecturers: [
      { id: 2, name: 'Dr. Thabo Moloi', faculty: 'Faculty of ICT (FICT)' },
      { id: 6, name: 'Dr. Lerato Mokoena', faculty: 'Faculty of ICT (FICT)' },
      { id: 7, name: 'Prof. David Khumalo', faculty: 'Faculty of ICT (FICT)' },
      { id: 8, name: 'Dr. Sarah Mofokeng', faculty: 'Business' }
    ],
    students: [
      { id: 1, name: 'Kgotso Nkosi', faculty: 'Faculty of ICT (FICT)' },
      { id: 5, name: 'Mpho Dlamini', faculty: 'Faculty of ICT (FICT)' },
      { id: 9, name: 'Lerato Phiri', faculty: 'Business' },
      { id: 10, name: 'Tumi van Wyk', faculty: 'Mathematics' }
    ],
    courses: [
      { id: 1, code: 'BIOP2110', name: 'Object Oriented Programming I', type: 'Major', credits: 10.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 2, code: 'BIMT2108', name: 'Multimedia Technology', type: 'Major', credits: 8.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 3, code: 'BBCO2108', name: 'Concepts of Organization', type: 'Minor', credits: 8.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 4, code: 'BIDC2110', name: 'Data Communication & Networking', type: 'Major', credits: 10.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 5, code: 'BIWA2110', name: 'Web Application Development', type: 'Major', credits: 10.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 6, code: 'BIIC2110', name: 'Introduction to Computer Architecture', type: 'Major', credits: 10.0, faculty: 'Faculty of ICT (FICT)' },
      { id: 7, code: 'BMGT2101', name: 'Business Management', type: 'Major', credits: 12.0, faculty: 'Business' },
      { id: 8, code: 'BMKT2102', name: 'Marketing Principles', type: 'Major', credits: 10.0, faculty: 'Business' }
    ],
    classes: [
      { id: 1, name: 'BIOP2110-A', course_id: 1, lecturer_id: 2, students: 45, venue: 'Lab 101', time: '08:00' },
      { id: 2, name: 'BIMT2108-B', course_id: 2, lecturer_id: 2, students: 38, venue: 'Lab 102', time: '10:00' },
      { id: 3, name: 'BBCO2108-C', course_id: 3, lecturer_id: 6, students: 52, venue: 'Room 201', time: '14:00' },
      { id: 4, name: 'BIDC2110-D', course_id: 4, lecturer_id: 2, students: 42, venue: 'Lab 103', time: '12:00' },
      { id: 5, name: 'BIWA2110-E', course_id: 5, lecturer_id: 6, students: 48, venue: 'Lab 104', time: '16:00' },
      { id: 6, name: 'BIIC2110-F', course_id: 6, lecturer_id: 2, students: 35, venue: 'Room 202', time: '09:00' },
      { id: 7, name: 'BMGT2101-G', course_id: 7, lecturer_id: 8, students: 60, venue: 'Room 301', time: '11:00' }
    ]
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('dashboard');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadReports();
      loadClasses();
      loadCourses();
      if (user.role === 'student') {
        loadStudentRatings();
      }
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadClasses = async () => {
    try {
      setClasses(sothoData.classes);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadCourses = async () => {
    try {
      setCourses(sothoData.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadStudentRatings = async () => {
    const mockRatings = {
      1: { rating: 4, comment: 'Great lecture!' },
      2: { rating: 5, comment: 'Very informative' }
    };
    setRatings(mockRatings);
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setCurrentView('dashboard');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      await axios.post('/api/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCurrentView('login');
  };

  // Submit report function
  const submitReport = async (reportData) => {
    try {
      await axios.post('/api/reports', {
        ...reportData,
        lecturer_id: user.id
      });
      loadReports();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Submission failed' };
    }
  };

  // Submit rating function (Student only)
  const submitRating = async (reportId, rating, comment) => {
    try {
      setRatings(prev => ({
        ...prev,
        [reportId]: { rating, comment }
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to submit rating' };
    }
  };

  // Submit feedback function (PRL only) - Now visible to lecturers
  const submitFeedback = async (reportId, feedbackText) => {
    try {
      setFeedback(prev => ({
        ...prev,
        [reportId]: { text: feedbackText, date: new Date().toLocaleDateString() }
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to submit feedback' };
    }
  };

  // Add new course (PL only)
  const addCourse = async (courseData) => {
    try {
      const newCourse = {
        id: courses.length + 1,
        ...courseData,
        credits: parseFloat(courseData.credits)
      };
      setCourses(prev => [...prev, newCourse]);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add course' };
    }
  };

  // Assign lecturer to class (PL only)
  const assignLecturer = async (classId, lecturerId) => {
    try {
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, lecturer_id: lecturerId } : cls
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign lecturer' };
    }
  };

  // Search function
  const searchReports = async () => {
    try {
      const response = await axios.get(`/api/search?q=${searchTerm}`);
      setReports(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const response = await axios.get('/api/export/reports', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lecture-reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Login Component - Updated with FICT faculty option
  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerData, setRegisterData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      faculty: 'Faculty of ICT (FICT)'
    });

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      }
    };

    const handleRegister = async (e) => {
      e.preventDefault();
      setError('');

      if (registerData.password !== registerData.confirmPassword) {
        return setError('Passwords do not match');
      }

      const result = await register(registerData);
      if (result.success) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        setError(result.error);
      }
    };

    if (isRegistering) {
      return (
        <div className="login-container">
          <div className="login-form" style={{maxWidth: '500px'}}>
            <h2>Create Account</h2>
            {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
            
            <form onSubmit={handleRegister} className="form">
              <input type="text" placeholder="Full Name" value={registerData.name} 
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})} required />
              
              <input type="email" placeholder="Email" value={registerData.email} 
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})} required />
              
              <select value={registerData.role} 
                onChange={(e) => setRegisterData({...registerData, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="principal_lecturer">Principal Lecturer</option>
                <option value="program_leader">Program Leader</option>
              </select>
              
              <select value={registerData.faculty} 
                onChange={(e) => setRegisterData({...registerData, faculty: e.target.value})}>
                <option value="Faculty of ICT (FICT)">Faculty of ICT (FICT)</option>
                <option value="Business">Business</option>
                <option value="Mathematics">Mathematics</option>
              </select>
              
              <input type="password" placeholder="Password" value={registerData.password} 
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})} required />
              
              <input type="password" placeholder="Confirm Password" value={registerData.confirmPassword} 
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} required />
              
              <button type="submit">Create Account</button>
            </form>

            <p style={{textAlign: 'center', marginTop: '1rem'}}>
              Already have an account? 
              <button type="button" onClick={() => setIsRegistering(false)} style={{background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer'}}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="login-container">
        <div className="login-form">
          <h2>LUCT Faculty Reporting System</h2>
          {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
          
          <form onSubmit={handleLogin} className="form">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign In</button>
          </form>

          <p style={{textAlign: 'center', marginTop: '1rem'}}>
            Don't have an account? 
            <button type="button" onClick={() => setIsRegistering(true)} style={{background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer'}}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Student Rating Component
  const StudentRating = ({ report, onClose }) => {
    const [rating, setRating] = useState(ratings[report.id]?.rating || 0);
    const [comment, setComment] = useState(ratings[report.id]?.comment || '');

    const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await submitRating(report.id, rating, comment);
      if (result.success) {
        alert('Rating submitted successfully!');
        onClose();
      } else {
        alert('Error: ' + result.error);
      }
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{background: 'white', padding: '2rem', borderRadius: '10px', width: '90%', maxWidth: '500px'}}>
          <h3>Rate Lecture: {report.topic_taught}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div>
              <label>Rating (1-5 stars):</label>
              <div style={{display: 'flex', gap: '0.5rem', margin: '0.5rem 0'}}>
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: star <= rating ? '#ffda77' : '#eee',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {star} ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <textarea 
              placeholder="Your comments..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              rows="4"
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">Submit Rating</button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // PRL Feedback Component
  const PRLFeedback = ({ report, onClose }) => {
    const [feedbackText, setFeedbackText] = useState(feedback[report.id]?.text || '');

    const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await submitFeedback(report.id, feedbackText);
      if (result.success) {
        alert('Feedback submitted successfully!');
        onClose();
      } else {
        alert('Error: ' + result.error);
      }
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{background: 'white', padding: '2rem', borderRadius: '10px', width: '90%', maxWidth: '500px'}}>
          <h3>Add Feedback for: {report.topic_taught}</h3>
          <form onSubmit={handleSubmit} className="form">
            <textarea 
              placeholder="Enter your feedback..." 
              value={feedbackText} 
              onChange={(e) => setFeedbackText(e.target.value)}
              rows="6"
              required
            />
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit">Submit Feedback</button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Student Monitoring View
  const StudentMonitoring = () => {
 const studentReports = reports;

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>Class Monitoring & Rating</h2>
          
          <div className="section">
            <h3>My Class Reports</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Date</th>
                    <th>Students Present</th>
                    <th>Topic</th>
                    <th>My Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReports.map(report => (
                    <tr key={report.id}>
                      <td>{report.class_name}</td>
                      <td>{report.course_name}</td>
                      <td>{report.lecturer_name}</td>
                      <td>{report.date_of_lecture}</td>
                      <td>{report.actual_students_present}</td>
                      <td>{report.topic_taught}</td>
                      <td>
                        {ratings[report.id] ? (
                          <span style={{color: '#27ae60'}}>
                            {ratings[report.id].rating} ⭐
                          </span>
                        ) : (
                          <span style={{color: '#95a5a6'}}>Not rated</span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => {
                            setSelectedReport(report);
                            setShowRating(true);
                          }}
                          style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}
                        >
                          {ratings[report.id] ? 'Update Rating' : 'Rate Lecture'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Attendance Summary</h3>
            <div className="dashboard-top">
              <div className="card">
                <h3>Total Lectures</h3>
                <p>{studentReports.length}</p>
              </div>
              <div className="card">
                <h3>Average Attendance</h3>
                <p>{studentReports.length > 0 ? Math.round(studentReports.reduce((sum, r) => sum + r.actual_students_present, 0) / studentReports.length) : 0}</p>
              </div>
              <div className="card">
                <h3>My Ratings Given</h3>
                <p>{Object.keys(ratings).length}</p>
              </div>
            </div>
          </div>
        </div>

        {showRating && selectedReport && (
          <StudentRating 
            report={selectedReport} 
            onClose={() => {
              setShowRating(false);
              setSelectedReport(null);
            }} 
          />
        )}
      </div>
    );
  };

  // Report Form Component
  const ReportForm = () => {
    const [formData, setFormData] = useState({
      class_id: '',
      week_of_reporting: '',
      date_of_lecture: '',
      actual_students_present: '',
      topic_taught: '',
      learning_outcomes: '',
      lecturer_recommendations: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await submitReport(formData);
      if (result.success) {
        alert('Report submitted successfully!');
        setCurrentView('dashboard');
      } else {
        alert('Error: ' + result.error);
      }
    };

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>Submit Lecture Report</h2>
          <div className="form-container">
            <form onSubmit={handleSubmit} className="form">
              <select value={formData.class_id} onChange={(e) => setFormData({...formData, class_id: e.target.value})} required>
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {courses.find(c => c.id === cls.course_id)?.name}
                  </option>
                ))}
              </select>

              <input type="text" placeholder="Week of Reporting" value={formData.week_of_reporting} 
                onChange={(e) => setFormData({...formData, week_of_reporting: e.target.value})} required />

              <input type="date" value={formData.date_of_lecture} 
                onChange={(e) => setFormData({...formData, date_of_lecture: e.target.value})} required />

              <input type="number" placeholder="Actual Students Present" value={formData.actual_students_present} 
                onChange={(e) => setFormData({...formData, actual_students_present: e.target.value})} required />

              <input type="text" placeholder="Topic Taught" value={formData.topic_taught} 
                onChange={(e) => setFormData({...formData, topic_taught: e.target.value})} required />

              <textarea placeholder="Learning Outcomes" value={formData.learning_outcomes} 
                onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})} required />

              <textarea placeholder="Lecturer Recommendations" value={formData.lecturer_recommendations} 
                onChange={(e) => setFormData({...formData, lecturer_recommendations: e.target.value})} required />

              <button type="submit">Submit Report</button>
              <button type="button" onClick={() => setCurrentView('dashboard')} className="btn-secondary">
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // PRL Courses View - Updated with FICT
  const PRLCourses = () => {
    const facultyCourses = courses.filter(course => course.faculty === user.faculty);
    const facultyLecturers = sothoData.lecturers.filter(lecturer => lecturer.faculty === user.faculty);

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentView('reports')}>Reports</button>
            <button onClick={() => setCurrentView('prl-ratings')}>Ratings</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>Courses Under My Stream - {user.faculty}</h2>
          
          <div className="section">
            <h3>Faculty Courses</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Classes</th>
                    <th>Lecturers</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyCourses.map(course => {
                    const courseClasses = sothoData.classes.filter(cls => cls.course_id === course.id);
                    const courseLecturers = [...new Set(courseClasses.map(cls => 
                      sothoData.lecturers.find(lec => lec.id === cls.lecturer_id)?.name
                    ))].filter(Boolean);

                    return (
                      <tr key={course.id}>
                        <td><strong>{course.code}</strong></td>
                        <td>{course.name}</td>
                        <td>
                          <span className={`role-badge ${course.type === 'Major' ? 'role-lecturer' : 'role-student'}`}>
                            {course.type}
                          </span>
                        </td>
                        <td>{course.credits}</td>
                        <td>{courseClasses.length}</td>
                        <td>{courseLecturers.join(', ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Faculty Lecturers</h3>
            <div className="dashboard-top">
              {facultyLecturers.map(lecturer => {
                const lecturerClasses = sothoData.classes.filter(cls => cls.lecturer_id === lecturer.id);
                const lecturerCourses = [...new Set(lecturerClasses.map(cls => 
                  courses.find(course => course.id === cls.course_id)?.code
                ))].filter(Boolean);

                return (
                  <div key={lecturer.id} className="card">
                    <h3>{lecturer.name}</h3>
                    <p>Courses: {lecturerCourses.length}</p>
                    <p>Classes: {lecturerClasses.length}</p>
                    <small>Teaching: {lecturerCourses.join(', ')}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <h3>Class Monitoring</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Venue</th>
                    <th>Time</th>
                    <th>Students</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {sothoData.classes.filter(cls => {
                    const course = courses.find(c => c.id === cls.course_id);
                    return course?.faculty === user.faculty;
                  }).map(cls => {
                    const course = courses.find(c => c.id === cls.course_id);
                    const lecturer = sothoData.lecturers.find(lec => lec.id === cls.lecturer_id);
                    const classReports = reports.filter(report => report.class_id === cls.id);

                    return (
                      <tr key={cls.id}>
                        <td>{cls.name}</td>
                        <td>{course?.name} ({course?.code})</td>
                        <td>{lecturer?.name}</td>
                        <td>{cls.venue}</td>
                        <td>{cls.time}</td>
                        <td>{cls.students}</td>
                        <td>
                          <span className={classReports.length > 0 ? 'role-badge role-program_leader' : 'role-badge role-student'}>
                            {classReports.length} reports
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // PRL Rating Analytics - Updated with FICT
  const PRLRatingAnalytics = () => {
    const facultyReports = reports.filter(report => {
      const course = courses.find(c => c.name === report.course_name);
      return course?.faculty === user.faculty;
    });

    const lecturerRatings = {};
    facultyReports.forEach(report => {
      if (!lecturerRatings[report.lecturer_name]) {
        lecturerRatings[report.lecturer_name] = [];
      }
      lecturerRatings[report.lecturer_name].push(Math.floor(Math.random() * 2) + 3);
    });

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentView('prl-courses')}>Courses</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>Teaching Quality Analytics - {user.faculty}</h2>
          
          <div className="section">
            <h3>Lecturer Performance Ratings</h3>
            <div className="dashboard-top">
              {Object.entries(lecturerRatings).map(([lecturer, ratings]) => {
                const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
                return (
                  <div key={lecturer} className="card">
                    <h3>{lecturer}</h3>
                    <p style={{fontSize: '2rem', color: avgRating >= 4 ? '#27ae60' : avgRating >= 3 ? '#f39c12' : '#e74c3c'}}>
                      {avgRating} ⭐
                    </p>
                    <small>Based on {ratings.length} evaluations</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <h3>Course Rating Distribution</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Total Reports</th>
                    <th>Avg Rating</th>
                    <th>Feedback Given</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyReports.map(report => {
                    const hasFeedback = feedback[report.id];
                    return (
                      <tr key={report.id}>
                        <td>{report.course_name}</td>
                        <td>{report.lecturer_name}</td>
                        <td>1</td>
                        <td>
                          <span style={{color: '#f39c12', fontWeight: 'bold'}}>
                            {(Math.random() * 2 + 3).toFixed(1)} ⭐
                          </span>
                        </td>
                        <td>
                          {hasFeedback ? (
                            <span style={{color: '#27ae60'}}>✓ Feedback Provided</span>
                          ) : (
                            <span style={{color: '#e74c3c'}}>Pending Feedback</span>
                          )}
                        </td>
                        <td>
                          <button 
                            onClick={() => {
                              setSelectedReport(report);
                              setShowFeedback(true);
                            }}
                            className={hasFeedback ? 'btn-secondary' : ''}
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}
                          >
                            {hasFeedback ? 'Update Feedback' : 'Add Feedback'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Program Leader Courses Management - Updated with FICT
  const PLCourses = () => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [showAssignLecturer, setShowAssignLecturer] = useState(false);

    const handleAddCourse = async (e) => {
      e.preventDefault();
      const result = await addCourse(newCourse);
      if (result.success) {
        alert('Course added successfully!');
        setNewCourse({ code: '', name: '', type: 'Major', credits: '', faculty: 'Faculty of ICT (FICT)' });
        setShowAddCourse(false);
      } else {
        alert('Error: ' + result.error);
      }
    };

    const handleAssignLecturer = async (e) => {
      e.preventDefault();
      const lecturerId = parseInt(e.target.lecturer.value);
      const result = await assignLecturer(selectedClass.id, lecturerId);
      if (result.success) {
        alert('Lecturer assigned successfully!');
        setShowAssignLecturer(false);
        setSelectedClass(null);
      } else {
        alert('Error: ' + result.error);
      }
    };

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentView('pl-reports')}>PRL Reports</button>
            <button onClick={() => setCurrentView('pl-monitoring')}>Monitoring</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <div className="flex-row">
            <h2>Course & Lecture Management</h2>
            <div className="right">
              <button onClick={() => setShowAddCourse(true)} className="btn-success">
                Add New Course
              </button>
            </div>
          </div>

          {showAddCourse && (
            <div className="section">
              <h3>Add New Course</h3>
              <form onSubmit={handleAddCourse} className="form">
                <input type="text" placeholder="Course Code" value={newCourse.code} 
                  onChange={(e) => setNewCourse({...newCourse, code: e.target.value})} required />
                <input type="text" placeholder="Course Name" value={newCourse.name} 
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} required />
                <select value={newCourse.type} onChange={(e) => setNewCourse({...newCourse, type: e.target.value})}>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
                <input type="number" placeholder="Credits" value={newCourse.credits} 
                  onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})} required step="0.5" />
                <select value={newCourse.faculty} onChange={(e) => setNewCourse({...newCourse, faculty: e.target.value})}>
                  <option value="Faculty of ICT (FICT)">Faculty of ICT (FICT)</option>
                  <option value="Business">Business</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                <div className="flex-row">
                  <button type="submit">Add Course</button>
                  <button type="button" onClick={() => setShowAddCourse(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="section">
            <h3>All Courses</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Faculty</th>
                    <th>Classes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => {
                    const courseClasses = classes.filter(cls => cls.course_id === course.id);
                    return (
                      <tr key={course.id}>
                        <td><strong>{course.code}</strong></td>
                        <td>{course.name}</td>
                        <td>
                          <span className={`role-badge ${course.type === 'Major' ? 'role-lecturer' : 'role-student'}`}>
                            {course.type}
                          </span>
                        </td>
                        <td>{course.credits}</td>
                        <td>{course.faculty}</td>
                        <td>{courseClasses.length}</td>
                        <td>
                          <span className={courseClasses.length > 0 ? 'role-badge role-program_leader' : 'role-badge role-student'}>
                            {courseClasses.length > 0 ? 'Active' : 'No Classes'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Class Management</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Current Lecturer</th>
                    <th>Students</th>
                    <th>Venue</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => {
                    const course = courses.find(c => c.id === cls.course_id);
                    const lecturer = sothoData.lecturers.find(lec => lec.id === cls.lecturer_id);
                    return (
                      <tr key={cls.id}>
                        <td>{cls.name}</td>
                        <td>{course?.name} ({course?.code})</td>
                        <td>{lecturer?.name || 'Unassigned'}</td>
                        <td>{cls.students}</td>
                        <td>{cls.venue}</td>
                        <td>{cls.time}</td>
                        <td>
                          <button 
                            onClick={() => {
                              setSelectedClass(cls);
                              setShowAssignLecturer(true);
                            }}
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}
                          >
                            Assign Lecturer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showAssignLecturer && selectedClass && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div style={{background: 'white', padding: '2rem', borderRadius: '10px', width: '90%', maxWidth: '400px'}}>
              <h3>Assign Lecturer to {selectedClass.name}</h3>
              <form onSubmit={handleAssignLecturer} className="form">
                <select name="lecturer" required>
                  <option value="">Select Lecturer</option>
                  {sothoData.lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} ({lecturer.faculty})
                    </option>
                  ))}
                </select>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button type="submit">Assign Lecturer</button>
                  <button type="button" onClick={() => {
                    setShowAssignLecturer(false);
                    setSelectedClass(null);
                  }} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Program Leader Reports View (PRL Reports)
  const PLReports = () => {
    const reportsWithFeedback = reports.filter(report => feedback[report.id]);

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentView('pl-courses')}>Courses</button>
            <button onClick={() => setCurrentView('pl-monitoring')}>Monitoring</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>PRL Feedback Reports</h2>
          
          <div className="section">
            <h3>Reports with PRL Feedback</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Date</th>
                    <th>Topic</th>
                    <th>PRL Feedback</th>
                    <th>Feedback Date</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsWithFeedback.map(report => {
                    const reportFeedback = feedback[report.id];
                    return (
                      <tr key={report.id}>
                        <td>{report.class_name}</td>
                        <td>{report.course_name}</td>
                        <td>{report.lecturer_name}</td>
                        <td>{report.date_of_lecture}</td>
                        <td>{report.topic_taught}</td>
                        <td>{reportFeedback.text}</td>
                        <td>{reportFeedback.date}</td>
                        <td>
                          <span style={{color: '#f39c12', fontWeight: 'bold'}}>
                            {(Math.random() * 2 + 3).toFixed(1)} ⭐
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Feedback Analytics</h3>
            <div className="dashboard-top">
              <div className="card">
                <h3>Total Reports</h3>
                <p>{reports.length}</p>
              </div>
              <div className="card">
                <h3>With PRL Feedback</h3>
                <p>{reportsWithFeedback.length}</p>
              </div>
              <div className="card">
                <h3>Feedback Rate</h3>
                <p>{reports.length > 0 ? Math.round((reportsWithFeedback.length / reports.length) * 100) : 0}%</p>
              </div>
              <div className="card">
                <h3>Avg Response Time</h3>
                <p>2.3 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Program Leader Monitoring
  const PLMonitoring = () => {
    const lecturerPerformance = sothoData.lecturers.map(lecturer => {
      const lecturerReports = reports.filter(report => report.lecturer_id === lecturer.id);
      const lecturerClasses = classes.filter(cls => cls.lecturer_id === lecturer.id);
      const feedbackCount = lecturerReports.filter(report => feedback[report.id]).length;
      
      return {
        ...lecturer,
        reports: lecturerReports.length,
        classes: lecturerClasses.length,
        students: lecturerClasses.reduce((sum, cls) => sum + cls.students, 0),
        feedbackReceived: feedbackCount,
        performance: lecturerReports.length > 0 ? 'Good' : 'Needs Review'
      };
    });

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            <button onClick={() => setCurrentView('pl-courses')}>Courses</button>
            <button onClick={() => setCurrentView('pl-reports')}>PRL Reports</button>
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <h2>Program Monitoring & Analytics</h2>
          
          <div className="section">
            <h3>Lecturer Performance Overview</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lecturer</th>
                    <th>Faculty</th>
                    <th>Classes</th>
                    <th>Students</th>
                    <th>Reports</th>
                    <th>PRL Feedback</th>
                    <th>Performance</th>
                    <th>Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturerPerformance.map(lecturer => (
                    <tr key={lecturer.id}>
                      <td><strong>{lecturer.name}</strong></td>
                      <td>{lecturer.faculty}</td>
                      <td>{lecturer.classes}</td>
                      <td>{lecturer.students}</td>
                      <td>{lecturer.reports}</td>
                      <td>{lecturer.feedbackReceived}</td>
                      <td>
                        <span className={`role-badge ${
                          lecturer.performance === 'Good' ? 'role-program_leader' : 
                          lecturer.performance === 'Needs Review' ? 'role-student' : 'role-principal_lecturer'
                        }`}>
                          {lecturer.performance}
                        </span>
                      </td>
                      <td>
                        <span style={{color: '#f39c12', fontWeight: 'bold'}}>
                          {(Math.random() * 2 + 3).toFixed(1)} ⭐
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Program Statistics</h3>
            <div className="dashboard-top">
              <div className="card">
                <h3>Total Courses</h3>
                <p>{courses.length}</p>
              </div>
              <div className="card">
                <h3>Active Classes</h3>
                <p>{classes.length}</p>
              </div>
              <div className="card">
                <h3>Total Students</h3>
                <p>{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
              </div>
              <div className="card">
                <h3>Teaching Staff</h3>
                <p>{sothoData.lecturers.length}</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Faculty Distribution</h3>
            <div className="dashboard-top">
              {['Faculty of ICT (FICT)', 'Business', 'Mathematics'].map(faculty => {
                const facultyCourses = courses.filter(c => c.faculty === faculty);
                const facultyClasses = classes.filter(cls => {
                  const course = courses.find(c => c.id === cls.course_id);
                  return course?.faculty === faculty;
                });
                
                return (
                  <div key={faculty} className="card">
                    <h3>{faculty}</h3>
                    <p>Courses: {facultyCourses.length}</p>
                    <p>Classes: {facultyClasses.length}</p>
                    <p>Students: {facultyClasses.reduce((sum, cls) => sum + cls.students, 0)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update Reports View to show feedback to lecturers
  const ReportsView = () => {
    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
            {user?.role === 'student' && (
              <button onClick={() => setCurrentView('student-monitoring')}>Monitoring</button>
            )}
            {user?.role === 'principal_lecturer' && (
              <button onClick={() => setCurrentView('prl-courses')}>Courses</button>
            )}
            {user?.role === 'program_leader' && (
              <button onClick={() => setCurrentView('pl-courses')}>Courses</button>
            )}
            <span style={{color: '#ffda77'}}>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <div className="flex-row">
            <h2>Lecture Reports</h2>
            <div className="right">
              <button onClick={exportToExcel} className="export-btn">Export to Excel</button>
            </div>
          </div>

          <div className="flex-row">
            <input type="text" placeholder="Search reports..." value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
            <button onClick={searchReports}>Search</button>
            <button onClick={loadReports}>Clear</button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Course</th>
                  <th>Lecturer</th>
                  <th>Week</th>
                  <th>Date</th>
                  <th>Students Present</th>
                  <th>Topic</th>
                  {/* Show feedback column to PRL and Lecturers */}
                  {(user?.role === 'principal_lecturer' || user?.role === 'lecturer') && <th>PRL Feedback</th>}
                  {user?.role === 'principal_lecturer' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.class_name}</td>
                    <td>{report.course_name}</td>
                    <td>{report.lecturer_name}</td>
                    <td>{report.week_of_reporting}</td>
                    <td>{report.date_of_lecture}</td>
                    <td>{report.actual_students_present}</td>
                    <td>{report.topic_taught}</td>
                    {/* Show feedback to PRL and the lecturer who created the report */}
                    {(user?.role === 'principal_lecturer' || (user?.role === 'lecturer' && report.lecturer_id === user.id)) && (
                      <td>
                        {feedback[report.id] ? (
                          <div>
                            <strong>Feedback:</strong> {feedback[report.id].text}
                            <br />
                            <small>Date: {feedback[report.id].date}</small>
                          </div>
                        ) : (
                          <span style={{color: '#95a5a6'}}>No feedback yet</span>
                        )}
                      </td>
                    )}
                    {user?.role === 'principal_lecturer' && (
                      <td>
                        <button 
                          onClick={() => {
                            setSelectedReport(report);
                            setShowFeedback(true);
                          }}
                          style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}
                        >
                          {feedback[report.id] ? 'Update Feedback' : 'Add Feedback'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showFeedback && selectedReport && user?.role === 'principal_lecturer' && (
          <PRLFeedback 
            report={selectedReport} 
            onClose={() => {
              setShowFeedback(false);
              setSelectedReport(null);
            }} 
          />
        )}
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const getStats = () => {
      switch(user?.role) {
        case 'student':
          const studentReports = reports.filter(report => 
            report.class_name.includes('BIOP2110') || report.class_name.includes('BIMT2108')
          );
          return [
            { title: 'My Lectures', value: studentReports.length },
            { title: 'Courses', value: '6' },
            { title: 'Ratings Given', value: Object.keys(ratings).length },
            { title: 'Attendance Rate', value: '85%' }
          ];
        case 'lecturer':
          const lecturerReports = reports.filter(r => r.lecturer_id === user.id);
          const lecturerFeedback = lecturerReports.filter(r => feedback[r.id]).length;
          return [
            { title: 'My Reports', value: lecturerReports.length },
            { title: 'My Classes', value: classes.filter(c => c.lecturer_id === user.id).length },
            { title: 'PRL Feedback', value: lecturerFeedback },
            { title: 'Average Rating', value: '4.2' }
          ];
        case 'principal_lecturer':
          const facultyReports = reports.filter(report => {
            const course = courses.find(c => c.name === report.course_name);
            return course?.faculty === user.faculty;
          });
          return [
            { title: 'Faculty Reports', value: facultyReports.length },
            { title: 'Courses', value: courses.filter(c => c.faculty === user.faculty).length },
            { title: 'Lecturers', value: sothoData.lecturers.filter(l => l.faculty === user.faculty).length },
            { title: 'Pending Feedback', value: facultyReports.filter(r => !feedback[r.id]).length }
          ];
        case 'program_leader':
          const reportsWithFeedback = reports.filter(report => feedback[report.id]);
          return [
            { title: 'All Reports', value: reports.length },
            { title: 'Total Courses', value: courses.length },
            { title: 'Teaching Staff', value: sothoData.lecturers.length },
            { title: 'PRL Feedback Given', value: reportsWithFeedback.length }
          ];
        default:
          return [];
      }
    };

    const getQuickActions = () => {
      const actions = [
        { label: 'View Reports', action: () => setCurrentView('reports') }
      ];

      if (user?.role === 'student') {
        actions.push({ label: 'Class Monitoring', action: () => setCurrentView('student-monitoring') });
      }
      if (user?.role === 'lecturer') {
        actions.push({ label: 'Submit Report', action: () => setCurrentView('report-form') });
      }
      if (user?.role === 'principal_lecturer') {
        actions.push(
          { label: 'View Courses', action: () => setCurrentView('prl-courses') },
          { label: 'Rating Analytics', action: () => setCurrentView('prl-ratings') }
        );
      }
      if (user?.role === 'program_leader') {
        actions.push(
          { label: 'Manage Courses', action: () => setCurrentView('pl-courses') },
          { label: 'PRL Reports', action: () => setCurrentView('pl-reports') },
          { label: 'Program Monitoring', action: () => setCurrentView('pl-monitoring') }
        );
      }

      return actions;
    };

    return (
      <div>
        <div className="navbar">
          <div className="logo-area">
            <div className="logo"></div>
            <span className="brand">LUCT Reporting</span>
          </div>
          <div className="nav-links">
            {getQuickActions().map((action, index) => (
              <button key={index} onClick={action.action}>{action.label}</button>
            ))}
            <span style={{color: '#ffda77'}}>{user?.name} ({user?.role})</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="main-content">
          <div className="dashboard-top">
            <h2>Welcome, {user?.name}!</h2>
            <span className={`role-badge role-${user?.role}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          
          <div className="dashboard-top">
            {getStats().map((stat, index) => (
              <div key={index} className="card">
                <h3>{stat.title}</h3>
                <p>{stat.value}</p>
              </div>
            ))}
          </div>

          {user?.role === 'program_leader' && (
            <div className="section">
              <h3>Program Overview</h3>
              <div className="dashboard-top">
                <div className="card">
                  <h3>Faculties</h3>
                  <p>3</p>
                </div>
                <div className="card">
                  <h3>Active Classes</h3>
                  <p>{classes.length}</p>
                </div>
                <div className="card">
                  <h3>Total Students</h3>
                  <p>{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
                </div>
                <div className="card">
                  <h3>Report Submission Rate</h3>
                  <p>78%</p>
                </div>
              </div>
            </div>
          )}

          <div className="section">
            <h3>Recent Activity</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Topic</th>
                    {user?.role === 'student' && <th>Status</th>}
                    {(user?.role === 'principal_lecturer' || user?.role === 'program_leader') && <th>Lecturer</th>}
                    {user?.role === 'lecturer' && <th>PRL Feedback</th>}
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 5).map(report => (
                    <tr key={report.id}>
                      <td>{report.class_name}</td>
                      <td>{report.course_name}</td>
                      <td>{report.date_of_lecture}</td>
                      <td>{report.topic_taught}</td>
                      {user?.role === 'student' && (
                        <td>
                          {ratings[report.id] ? (
                            <span style={{color: '#27ae60'}}>Rated</span>
                          ) : (
                            <span style={{color: '#e74c3c'}}>Pending Rating</span>
                          )}
                        </td>
                      )}
                      {(user?.role === 'principal_lecturer' || user?.role === 'program_leader') && (
                        <td>{report.lecturer_name}</td>
                      )}
                      {user?.role === 'lecturer' && (
                        <td>
                          {feedback[report.id] ? (
                            <span style={{color: '#27ae60'}}>✓ Received</span>
                          ) : (
                            <span style={{color: '#95a5a6'}}>Pending</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render based on current view
  if (currentView === 'login' || !user) {
    return <Login />;
  }

  if (currentView === 'student-monitoring') {
    return <StudentMonitoring />;
  }

  if (currentView === 'report-form') {
    return <ReportForm />;
  }

  if (currentView === 'reports') {
    return <ReportsView />;
  }

  if (currentView === 'prl-courses') {
    return <PRLCourses />;
  }

  if (currentView === 'prl-ratings') {
    return <PRLRatingAnalytics />;
  }

  if (currentView === 'pl-courses') {
    return <PLCourses />;
  }

  if (currentView === 'pl-reports') {
    return <PLReports />;
  }

  if (currentView === 'pl-monitoring') {
    return <PLMonitoring />;
  }

  return <Dashboard />;
}

export default App;
