import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '..';
import '../components/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [approvalMessage, setApprovalMessage] = useState(""); // State i ri për 403
    const [loginInput, setLogin] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (localStorage.getItem('auth_token')) {
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

        try {
            const res = await api.post('/login', loginInput);

            if (res.data.status === 'success') {
                localStorage.setItem('auth_token', res.data.token);
                localStorage.setItem('auth_role', res.data.user.role);
                localStorage.setItem('auth_name', res.data.user.name);

                const role = res.data.user.role;
                if (role === 'admin') {
                    navigate('/adminDashboard');
                } else if (role === 'business_owner') {
                    navigate('/owner');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            const status = err.response?.status;
            const resData = err.response?.data;

            if (status === 403 && resData.status === 'awaiting_approval') {
                // Trajtimi i statusit PENDING
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

                {/* Box për Gabimet Standarde (401, 422, 500) */}
                {error && (
                    <div className="error-box" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                        <p>{error}</p>
                    </div>
                )}

                {/* Box për Përdoruesit Pending (403) */}
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
                    Nuk keni llogari? <Link to="/businessRegister" className="register-link">Regjistrohuni falas</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;