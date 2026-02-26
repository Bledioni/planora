import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '..';
import '../components/Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/public/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                setError('Nuk u gjet asnjë llogari me këtë email.');
            } else {
                setError('Ndodhi një gabim. Provoni përsëri.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Keni harruar fjalëkalimin?</h2>
                    <p>Shkruani emailin tuaj dhe do t'ju dërgojmë një link për ta rivendosur</p>
                </div>

                {error && (
                    <div className="error-box">
                        <p>{error}</p>
                    </div>
                )}

                {success ? (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
                        <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '1rem', marginBottom: '6px' }}>
                            Email-i u dërgua!
                        </p>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                            Kontrolloni Emailin tuaj dhe klikoni linkun për të rivendosur fjalëkalimin.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                                placeholder="emri@shembull.com"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="login-button">
                            {loading ? 'Duke dërguar...' : 'Dërgo Linkun'}
                        </button>
                    </form>
                )}

                <div className="register-footer">
                    Kujtuati fjalëkalimin? <Link to="/login" className="register-link">Kthehu te Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;