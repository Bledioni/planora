import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Store, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  PlusCircle
} from 'lucide-react';

import '../style/AdminSidebar.css'

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/adminDashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Businesses',
      icon: Building2,
      hasSubmenu: true,
      submenu: [
        {
          name: 'All Businesses',
          path: '/admin/businesses',
          icon: Store,
        },
        {
          name: 'Business List',
          path: '/admin/AdminBusinessList',
          icon: Building2,
        },
      ]
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-menu-button"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Logo/Brand */}
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Planora Admin</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                {!item.hasSubmenu ? (
                  <Link
                    to={item.path}
                    className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="menu-icon" size={20} />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
                      className={`submenu-button ${
                        location.pathname.includes('/admin/businesses') || 
                        location.pathname.includes('/admin/AdminBusinessList')
                          ? 'active' 
                          : ''
                      }`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon className="menu-icon" size={20} />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown 
                        className={`submenu-chevron ${isBusinessMenuOpen ? 'open' : ''}`}
                        size={16}
                      />
                    </button>

                    {/* Submenu */}
                    <div className={`submenu-container ${isBusinessMenuOpen ? 'open' : 'closed'}`}>
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <subItem.icon className="submenu-icon" size={16} />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Quick Actions Section */}
          <div className="quick-actions">
            <p className="quick-actions-title">Quick Actions</p>
            <div className="quick-actions-list">
              <button
                onClick={() => {
                  navigate('/admin/create-business');
                  setIsMobileOpen(false);
                }}
                className="quick-action-button"
              >
                <PlusCircle className="quick-action-icon green" size={16} />
                <span>Create Business</span>
              </button>
              <button
                onClick={() => {
                  navigate('/admin/adminUsers');
                  setIsMobileOpen(false);
                }}
                className="quick-action-button"
              >
                <UserPlus className="quick-action-icon blue" size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <p className="user-name">Admin User</p>
              <p className="user-email">admin@planora.com</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="logout-icon" size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;