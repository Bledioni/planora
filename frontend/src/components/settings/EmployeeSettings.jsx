import React from 'react';
import EmployeeSidebar from '../employees/script/EmployeeSidebar';
import ChangePasswordSection from './ChangePasswordSection';
import { Settings as SettingsIcon } from 'lucide-react';
import './Settings.css';

const EmployeeSettings = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: "'DM Sans', sans-serif" }}>
            <EmployeeSidebar />
            <main style={{ flex: 1, padding: '32px 16px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <ChangePasswordSection />
                </div>
            </main>
        </div>
    );
};

export default EmployeeSettings;