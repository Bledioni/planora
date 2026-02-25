import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, backend } from '..';
import '../components/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [approvalMessage, setApprovalMessage] = useState("");
    const [loginInput, setLogin] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (localStorage.getItem('auth_role')) {
            navigate('/');
        }
    }, [navigate]);

    const handleInput = (e) => {
        setLogin({ ...loginInput, [e.target.name]: e.target.value });
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setApprovalMessage("");
            console.log('Login submitted!'); // ← add this


        try {
            // ← CSRF cookie using backend instance
            await backend.get('/sanctum/csrf-cookie');

            const res = await api.post('/auth/login', loginInput);

            console.log('Login response:', res.data); // ← add this


            if (res.data.status === 'success') {
    const role = res.data.user.role;
    if (role === 'admin') {
        navigate('/admin/adminDashboard', { state: { user: res.data.user } });
    } else if (role === 'business_owner') {
        navigate('/owner/my-schedules', { state: { user: res.data.user } });
    } 
    else if(role === 'employee'){

        navigate('/employee/dashboard', {state: {user: res.data.user}})

    }
    else {
        navigate('/', { state: { user: res.data.user } });
    }
}
        } catch (err) {
            const status = err.response?.status;
            const resData = err.response?.data;

            if (status === 403 && resData.status === 'awaiting_approval') {
                setApprovalMessage(resData.message);
            } else if (status === 401) {
                setError("Email ose Password i pasaktë.");
            } else if (status === 422) {
                setError("Të dhënat nuk janë të vlefshme.");
            } else {
                setError("Ndodhi një gabim në server. Provoni përsëri.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Mirëseerdhët</h2>
                    <p>Identifikohuni për të vazhduar në Planora</p>
                </div>

                {error && (
                    <div className="error-box" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                        <p>{error}</p>
                    </div>
                )}

                {approvalMessage && (
                    <div className="info-box" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px' }}>⏳</span>
                            <p style={{ fontSize: '14px', fontWeight: '500' }}>{approvalMessage}</p>
                        </div>
                    </div>
                )}

                {!approvalMessage && (
                    <form onSubmit={loginSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                onChange={handleInput}
                                value={loginInput.email}
                                className="login-input"
                                placeholder="emri@shembull.com"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Fjalëkalimi</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                onChange={handleInput}
                                value={loginInput.password}
                                className="login-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="login-button">
                            {loading ? 'Duke u procesuar...' : 'Hyni në llogari'}
                        </button>
                    </form>
                )}

                {approvalMessage && (
                    <button onClick={() => setApprovalMessage("")} className="login-button" style={{ marginTop: '10px', backgroundColor: '#64748b' }}>
                        Kthehu te Login
                    </button>
                )}

                <div className="register-footer">
                    Nuk keni llogari? <Link to="/register" className="register-link">Regjistrohuni falas</Link>
                </div>
                <div className="register-footer">
                    <Link to="/forgot-password" className="register-link">Keni harruar fjalëkalimin?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;