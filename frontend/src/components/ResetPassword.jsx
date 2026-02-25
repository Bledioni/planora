import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '..';
import '../components/Login.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: emailFromUrl,
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Fjalëkalimet nuk përputhen.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Fjalëkalimi duhet të ketë të paktën 8 karaktere.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const status = err.response?.status;
            if (status === 422) {
                setError('Token-i është i pavlefshëm ose ka skaduar. Kërkoni një link të ri.');
            } else {
                setError('Ndodhi një gabim. Provoni përsëri.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Link i pavlefshëm</h2>
                        <p>Ky link i rivendosjes nuk është i vlefshëm.</p>
                    </div>
                    <Link to="/forgot-password" className="login-button" style={{ textDecoration: 'none', marginTop: 0 }}>
                        Kërko link të ri
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Rivendos Fjalëkalimin</h2>
                    <p>Vendosni fjalëkalimin tuaj të ri më poshtë</p>
                </div>

                {error && (
                    <div className="error-box">
                        <p>{error}</p>
                    </div>
                )}

                {success ? (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                        <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '1rem', marginBottom: '6px' }}>
                            Fjalëkalimi u ndryshua!
                        </p>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                            Po ju ridrejtojmë tek Login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInput}
                                className="login-input"
                                placeholder="emri@shembull.com"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Fjalëkalimi i Ri</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInput}
                                className="login-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password_confirmation">Konfirmo Fjalëkalimin</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleInput}
                                className="login-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="login-button">
                            {loading ? 'Duke ruajtur...' : 'Ruaj Fjalëkalimin e Ri'}
                        </button>
                    </form>
                )}

                <div className="register-footer">
                    <Link to="/login" className="register-link">Kthehu te Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;