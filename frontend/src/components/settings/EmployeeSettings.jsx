import React, { useEffect, useState } from 'react';
import EmployeeSidebar from '../employees/script/EmployeeSidebar';
import ChangePasswordSection from './ChangePasswordSection';
import { Settings as SettingsIcon, Link, Copy, Check } from 'lucide-react';
import { api } from '../../index';
import './Settings.css';

const EmployeeSettings = () => {
    const [myLink, setMyLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        api.get('/employee/my-link')
            .then(res => setMyLink(res.data.link))
            .catch(() => {});
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(myLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: "'DM Sans', sans-serif" }}>
            <EmployeeSidebar />
            <main style={{ flex: 1, padding: '32px 16px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Header */}
                    <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: '#eff6ff', color: '#2563eb', fontSize: '0.68rem',
                            fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em',
                            padding: '5px 11px', borderRadius: '100px', marginBottom: '14px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <SettingsIcon size={11} /> Cilësimet
                        </div>
                        <h1 style={{ fontSize: '1.55rem', fontWeight: '700', color: '#0d1117', margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>
                            Cilësimet e Llogarisë
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#6b7a99', margin: 0, textAlign: 'center' }}>
                            Menaxhoni sigurinë e llogarisë suaj
                        </p>
                    </div>

                    {/* Personal Booking Link */}
                    {myLink && (
                        <div style={{
                            background: 'white',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '22px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: '#eff6ff', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Link size={16} color="#2563eb" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#0d1117' }}>
                                        Linku juaj personal
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                        Vendoseni në bio-në tuaj të Instagram-it
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                fontSize: '0.8rem',
                                color: '#2563eb',
                                wordBreak: 'break-all',
                                marginTop: '14px',
                                marginBottom: '12px',
                                fontWeight: '500'
                            }}>
                                {myLink}
                            </div>

                            <button
                                onClick={handleCopy}
                                style={{
                                    width: '100%',
                                    background: copied ? '#22c55e' : '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.88rem',
                                    transition: 'background 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {copied ? <><Check size={16} /> U kopjua!</> : <><Copy size={16} /> Kopjo Linkun</>}
                            </button>
                        </div>
                    )}

                    {/* Change Password */}
                    <ChangePasswordSection />
                </div>
            </main>
        </div>
    );
};

export default EmployeeSettings;