import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const fillDemoCredentials = (role) => {
        const credentials = {
            student: { email: 'student@luct.com', password: 'student123' },
            lecturer: { email: 'lecturer@luct.com', password: 'lecturer123' },
            principal_lecturer: { email: 'prl@luct.com', password: 'prl123' },
            program_leader: { email: 'pl@luct.com', password: 'pl123' }
        };
        
        const cred = credentials[role];
        setEmail(cred.email);
        setPassword(cred.password);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>LUCT Faculty Reporting System</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Demo Accounts</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => fillDemoCredentials('student')}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                            Student Demo
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => fillDemoCredentials('lecturer')}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                            Lecturer Demo
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => fillDemoCredentials('principal_lecturer')}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                            PRL Demo
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => fillDemoCredentials('program_leader')}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                        >
                            PL Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;