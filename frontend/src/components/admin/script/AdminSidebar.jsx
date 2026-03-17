import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Store, MapPin,
  LogOut, Menu, X, ChevronRight, ChevronDown, Tag
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
        { name: 'All Businesses', path: '/admin/businesses',        icon: Store },
        { name: 'Business List',  path: '/admin/AdminBusinessList', icon: Building2 },
        { name: 'Vizitat',        path: '/admin/visits',            icon: MapPin },
      ]
    },
    { name: 'Email',      path: '/admin/send-email',                icon: LayoutDashboard },
    { name: 'Analytics',  path: '/admin/admin-analytics-dashboard', icon: LayoutDashboard },
    { name: 'Kategoritë', path: '/admin/categories',                icon: Tag },
  ];

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside
        className={`owner-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div className="owner-sidebar-header">
          <div className="logo-icon">P</div>
          <div className="header-text">
            <h2>Planora Admin</h2>
            <p>Management Panel</p>
          </div>
        </div>

        <nav
          className="owner-sidebar-nav"
          style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}
        >
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
                    className={`nav-item ${location.pathname.includes('business') || location.pathname.includes('visits') ? 'active' : ''}`}
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
                        <sub.icon size={15} />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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