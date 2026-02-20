import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Calendar, Users, BarChart3, 
    LogOut, Building2, ChevronRight, Menu, X 
} from 'lucide-react';
import '../style/OwnerSidebar.css';

const OwnerSidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // State for mobile menu

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        navigate('/logout');
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay to close menu when clicking outside */}
            {isOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

            <aside className={`owner-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="owner-sidebar-header">
                    <Building2 size={32} color="#1d7af2" />
                    <div>
                        <h2>Business Owner</h2>
                        <p>Panel i menaxhimit</p>
                    </div>
                </div>

                <nav className="owner-sidebar-nav">
                    <NavLink to="/owner/owner-dashboard" className="nav-item" onClick={closeMenu}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>

                    <NavLink to="/owner/my-schedules" className="nav-item" onClick={closeMenu}>
                        <Calendar size={20} />
                        <span>Orari Im</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>

                    <NavLink to="/owner/employees-schedules" className="nav-item" onClick={closeMenu}>
                        <Users size={20} />
                        <span>Orari i Punonjësve</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>

                    <NavLink to="/owner/analytics-dashboard" className="nav-item" onClick={closeMenu}>
                        <BarChart3 size={20} />
                        <span>Statistikat</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>
                    
                    <NavLink to="/owner/manage-schedule" className="nav-item" onClick={closeMenu}>
                        <Calendar size={20} />
                        <span>Terminet</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>
                    
                    <NavLink to="/owner/manage-services" className="nav-item" onClick={closeMenu}>
                        <BarChart3 size={20} />
                        <span>Sherbimet</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </NavLink>
                </nav>

                <div className="owner-sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Dil</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default OwnerSidebar;