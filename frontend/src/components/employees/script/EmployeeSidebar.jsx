import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, BarChart2, Clock, LogOut, Scissors } from 'lucide-react';
import { api } from '../../../index';
import '../style/EmployeeSidebar.css';

const EmployeeSidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

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
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Scissors size={18} />
                    </div>
                    <div className="sidebar-logo-text">
                        <span>Planora</span><strong>Book</strong>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="sidebar-section-label">Kryefaqja</p>
                    <NavLink
                        to="/employee/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Calendar size={18} /> Sot
                    </NavLink>

                    <p className="sidebar-section-label">Terminet</p>
                    <NavLink
                        to="/employee/appointments"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Clock size={18} /> Terminet e Mia
                    </NavLink>

                    <p className="sidebar-section-label">Analitika</p>
                    <NavLink
                        to="/employee/stats"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <BarChart2 size={18} /> Statistikat
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-logout-btn">
                        <LogOut size={16} /> Dil
                    </button>
                </div>
            </aside>
        </>
    );
};

export default EmployeeSidebar;