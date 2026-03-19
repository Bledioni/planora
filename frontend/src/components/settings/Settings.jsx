import React from 'react';
import { useUser } from '../../context/UserContext';
import ChangePasswordSection from './ChangePasswordSection';
import BusinessSettingsSection from './BusinessSettingsSection';
import AdminSettingsSection from './AdminSettingsSection';
import EmployeeSettingsSection from './EmployeeSettingsSection';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const { user, loading } = useUser();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const role = user?.role;

    return (
        <div style={{ minHeight: '100vh', background: '#f4f6fb', fontFamily: "'DM Sans', sans-serif", padding: '32px 16px' }}>
            <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Header */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#eff6ff', color: '#2563eb', fontSize: '0.68rem',
                        fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em',
                        padding: '5px 11px', borderRadius: '100px', marginBottom: '14px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <SettingsIcon size={11} /> Cilësimet
                    </div>
                    <h1 style={{ fontSize: '1.55rem', fontWeight: '700', color: '#0d1117', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Cilësimet e Llogarisë
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7a99', margin: 0 }}>
                        Mirë se vini, <strong>{user?.name}</strong> · {role}
                    </p>
                </div>

                {/* ✅ All roles see this */}
                <ChangePasswordSection />

                {/* ✅ Owner only */}
                {role === 'business_owner' && <BusinessSettingsSection />}

                {/* ✅ Admin only */}
                {role === 'admin' && <AdminSettingsSection />}

                {/* ✅ Employee only */}
                {role === 'employee' && <EmployeeSettingsSection />}

            </div>
        </div>
    );
};

export default Settings;