import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Store, 
  LogOut, Menu, X, ChevronRight, ChevronDown 
} from 'lucide-react';
import '../style/AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/adminDashboard', icon: LayoutDashboard },
    {
      name: 'Businesses',
      icon: Building2,
      hasSubmenu: true,
      submenu: [
        { name: 'All Businesses', path: '/admin/businesses', icon: Store },
        { name: 'Business List', path: '/admin/AdminBusinessList', icon: Building2 },
      ]
    },
    { name: 'Email', path: '/admin/send-email', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/admin-analytics-dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* 3 VIJAT (HAMBURGER) - Shfaqet vetëm në Mobile */}
      <button className="mobile-menu-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY KUR SIDEBAR-I ËSHTË I HAPUR NË MOBILE */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`owner-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="owner-sidebar-header">
          <div className="logo-icon">P</div>
          <div className="header-text">
            <h2>Planora Admin</h2>
            <p>Management Panel</p>
          </div>
        </div>

        <nav className="owner-sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={index} className="nav-group">
              {!item.hasSubmenu ? (
                <Link 
                  to={item.path} 
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  <ChevronRight size={16} className="nav-arrow" />
                </Link>
              ) : (
                <div className="submenu-wrapper">
                  <button 
                    className={`nav-item ${location.pathname.includes('business') ? 'active' : ''}`}
                    onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                    <ChevronDown size={16} className={`submenu-arrow ${isBusinessMenuOpen ? 'rotated' : ''}`} />
                  </button>
                  <div className={`submenu-content ${isBusinessMenuOpen ? 'expanded' : ''}`}>
                    {item.submenu.map((sub, i) => (
                      <Link 
                        key={i} 
                        to={sub.path} 
                        className={`sub-nav-item ${location.pathname === sub.path ? 'active' : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="owner-sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;