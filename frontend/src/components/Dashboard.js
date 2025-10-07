import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardStats = () => {
    switch (user.role) {
      case 'lecturer':
        return [
          { title: 'Total Reports', value: '24' },
          { title: 'Classes', value: '5' },
          { title: 'Students', value: '180' },
          { title: 'Rating', value: '4.5' }
        ];
      case 'student':
        return [
          { title: 'Courses', value: '6' },
          { title: 'Reports Viewed', value: '45' },
          { title: 'Ratings Given', value: '12' }
        ];
      case 'principal_lecturer':
        return [
          { title: 'Courses Under PRL', value: '8' },
          { title: 'Lecturers', value: '12' },
          { title: 'Pending Feedback', value: '5' }
        ];
      case 'program_leader':
        return [
          { title: 'Total Courses', value: '15' },
          { title: 'Programs', value: '4' },
          { title: 'Lecturers', value: '25' }
        ];
      default:
        return [];
    }
  };

  const getRoleFeatures = () => {
    const features = {
      student: [
        'View lecture reports',
        'Monitor class activities',
        'Rate lectures and provide feedback',
        'Track course progress'
      ],
      lecturer: [
        'Submit lecture reports',
        'Manage classes and courses',
        'Monitor student attendance',
        'View ratings and feedback'
      ],
      principal_lecturer: [
        'View all courses and lectures under stream',
        'Provide feedback on reports',
        'Monitor teaching quality',
        'View ratings and analytics'
      ],
      program_leader: [
        'Add and assign course modules',
        'View reports from PRLs',
        'Monitor program performance',
        'Manage lecturers and courses'
      ]
    };
    return features[user.role] || [];
  };

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="dashboard-top">
          <h2>Welcome, {user.name}!</h2>
          <span className={`role-badge role-${user.role}`}>
            {user.role.replace('_', ' ')}
          </span>
        </div>
        
        <div className="dashboard-top">
          {getDashboardStats().map((stat, index) => (
            <div key={index} className="card">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          ))}
        </div>
        
        <div className="section">
          <h3>Your Capabilities</h3>
          <div className="role-grid">
            <div className="role-card">
              <h3>Available Features</h3>
              <ul className="role-features">
                {getRoleFeatures().map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="role-card">
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {user.role === 'lecturer' && (
                  <a href="/report-form" className="form button" style={{ textAlign: 'center' }}>
                    Submit New Report
                  </a>
                )}
                <a href="/reports" className="form button btn-secondary" style={{ textAlign: 'center' }}>
                  View Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;