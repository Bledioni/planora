import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../index';

const ProtectedRoute = ({ allowedRoles }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [actualRole, setActualRole] = useState(null);
  const location = useLocation();
  const navigatedUser = location.state?.user;

  useEffect(() => {
    if (navigatedUser?.role) {
      setActualRole(navigatedUser.role);
      setIsVerifying(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setActualRole(res.data.role);
      } catch (err) {
        setActualRole(null);
      } finally {
        setIsVerifying(false);
      }
    };
    verifyUser();
  }, [navigatedUser]);

  if (isVerifying) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f7fe',
        fontFamily: 'Manrope, sans-serif',
        color: '#64748b',
        fontSize: '0.875rem',
        fontWeight: 500,
        gap: '10px'
      }}>
        <div style={{
          width: '18px', height: '18px',
          border: '2px solid #bfdbfe',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.65s linear infinite'
        }} />
        Duke verifikuar...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!actualRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const cleanAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
  const cleanActualRole = actualRole.toLowerCase().trim();

  if (!cleanAllowedRoles.includes(cleanActualRole)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;