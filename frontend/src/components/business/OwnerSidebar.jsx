import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Users, LogOut, Menu, X } from 'lucide-react';
import { api } from '../../index';
import '../business/style/OwnerSidebar.css';

const OwnerSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [business, setBusiness] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/owner/my-business').then(res => setBusiness(res.data)).catch(e => console.error(e));
    }, []);

    const bId = business?.id;

    return (
        <>
            <button className="mobile-nav-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`owner-sidebar-container ${isOpen ? 'show' : ''}`}>
                <div className="sidebar-brand">PlanoraBook</div>
                <nav className="sidebar-links">
                    <NavLink to={bId ? `/owner/dashboard/${bId}` : "#"} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to={bId ? `/owner/schedules/${bId}` : "#"} onClick={() => setIsOpen(false)}>
                        <Clock size={20} /> Oraret e Punës
                    </NavLink>
                    <NavLink to={bId ? `/owner/employees/${bId}` : "#"} onClick={() => setIsOpen(false)}>
                        <Users size={20} /> Punonjësit
                    </NavLink>
                </nav>
                <div style={{padding: '20px'}}>
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
                        <LogOut size={18} /> Dil
                    </button>
                </div>
            </aside>
        </>
    );
};
export default OwnerSidebar;