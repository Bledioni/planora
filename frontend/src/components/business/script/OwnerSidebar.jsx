import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Calendar, Users, BarChart3, 
    LogOut, ClipboardList
} from 'lucide-react';
import { api } from '../../../index';
import '../style/OwnerSidebar.css';
import logo from '../../../assets/IMG_5288.png';

const OwnerSidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            navigate('/login');
        } catch {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    return (
        <>
            <button
                className={`mobile-menu-toggle ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
            </button>

            {isOpen && (
                <div className="sidebar-overlay" onClick={closeMenu} />
            )}

            <aside
                className={`owner-sidebar ${isOpen ? 'open' : ''}`}
                style={{
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <img src={logo} alt="" style={{ width: '20px' }} />
                    </div>
                    <div className="sidebar-logo-text">
                        <span>Planora</span><strong>Book</strong>
                    </div>
                </div>

                <nav
                    className="owner-sidebar-nav"
                    style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}
                >
                    <p className="sidebar-section-label">Kryefaqja</p>
                    <NavLink to="/owner/my-schedules" onClick={closeMenu}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Calendar size={18} /> Terminet e Mia
                    </NavLink>

                    <p className="sidebar-section-label">Punonjësit</p>
                    <NavLink to="/owner/employees-schedules" onClick={closeMenu}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Users size={18} /> Terminet e Punonjësve
                    </NavLink>

                    <p className="sidebar-section-label">Analitika</p>
                    <NavLink to="/owner/analytics-dashboard" onClick={closeMenu}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <BarChart3 size={18} /> Statistikat
                    </NavLink>

                    <p className="sidebar-section-label">Menaxhimi</p>
                    <NavLink to="/owner/manage-schedule" onClick={closeMenu}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Calendar size={18} /> Orari
                    </NavLink>
                    <NavLink to="/owner/manage-services" onClick={closeMenu}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <ClipboardList size={18} /> Shërbimet
                    </NavLink>
                </nav>

                <div
                    className="owner-sidebar-footer"
                    style={{
                        flexShrink: 0,
                        paddingTop: '16px',
                        paddingBottom: 'max(env(safe-area-inset-bottom), 80px)',
                        borderTop: '1px solid #e2e8f0',
                        background: '#ffffff',
                    }}
                >
                    <button onClick={handleLogout} className="sidebar-logout-btn">
                        <LogOut size={16} /> Dil
                    </button>
                </div>
            </aside>
        </>
    );
};

export default OwnerSidebar;