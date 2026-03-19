import React, { useState } from 'react';
import { api } from '../../index';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const ChangePasswordSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const inputStyle = {
        width: '100%', padding: '11px 40px 11px 14px',
        border: '1px solid #e4e9f2', borderRadius: '10px',
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', color: '#0d1117', background: '#f4f6fb'
    };

    const labelStyle = {
        fontSize: '0.82rem', fontWeight: '600', color: '#0d1117',
        display: 'block', marginBottom: '6px'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Fjalëkalimet e reja nuk përputhen.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setSuccess('Fjalëkalimi u ndryshua me sukses!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            if (err.response?.status === 422) {
                setError(err.response?.data?.message || 'Fjalëkalimi aktual është i gabuar.');
            } else {
                setError('Ndodhi një gabim. Provoni përsëri.');
            }
        } finally {
            setLoading(false);
        }
    };

    const EyeButton = ({ show, toggle }) => (
        <button type="button" onClick={toggle} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: '#6b7a99', padding: 0
        }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
    );

    return (
        <div style={{ background: '#ffffff', border: '1px solid #e4e9f2', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 16px rgba(13,17,23,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e4e9f2' }}>
                <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Lock size={16} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0d1117', margin: 0 }}>Ndrysho Fjalëkalimin</h2>
                    <p style={{ fontSize: '0.78rem', color: '#6b7a99', margin: 0 }}>Rekomandohet të përdorni një fjalëkalim të fortë</p>
                </div>
            </div>

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', color: '#ef4444', fontSize: '0.85rem', fontWeight: '500', marginBottom: '20px' }}>
                    <AlertCircle size={15} /> {error}
                </div>
            )}
            {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', color: '#16a34a', fontSize: '0.85rem', fontWeight: '500', marginBottom: '20px' }}>
                    <CheckCircle size={15} /> {success}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                    { label: 'Fjalëkalimi Aktual', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                    { label: 'Fjalëkalimi i Ri', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: 'Konfirmo Fjalëkalimin e Ri', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map(({ label, value, set, show, toggle }) => (
                    <div key={label}>
                        <label style={labelStyle}>{label}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={show ? 'text' : 'password'}
                                value={value}
                                onChange={(e) => set(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={inputStyle}
                            />
                            <EyeButton show={show} toggle={toggle} />
                        </div>
                    </div>
                ))}

                <button type="submit" disabled={loading} style={{
                    background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff',
                    border: 'none', borderRadius: '10px', padding: '12px',
                    fontSize: '0.9rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', marginTop: '4px', transition: 'background 0.2s ease'
                }}>
                    {loading ? 'Duke ndryshuar...' : 'Ndrysho Fjalëkalimin'}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordSection;