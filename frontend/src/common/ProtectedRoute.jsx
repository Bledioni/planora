import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../index';

const ProtectedRoute = ({ allowedRoles }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [actualRole, setActualRole] = useState(null);
  const location = useLocation();
  const navigatedUser = location.state?.user;

  useEffect(() => {
    // If we just logged in, use the role from navigation state
    if (navigatedUser?.role) {
      setActualRole(navigatedUser.role);
      setIsVerifying(false);
      return;
    }

    // Otherwise verify with server (e.g. page refresh)
    const verifyUser = async () => {
      try {
        const res = await api.get('/auth/profile');
        setActualRole(res.data.role);
      } catch (err) {
        console.error("Verifikimi dështoi", err);
        setActualRole(null);
      } finally {
        setIsVerifying(false);
      }
    };
    verifyUser();
  }, [navigatedUser]);

  if (isVerifying) {
    return <div>Duke verifikuar autorizimin...</div>;
  }

  if (!actualRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const cleanAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
  const cleanActualRole = actualRole.toLowerCase().trim();

  if (!cleanAllowedRoles.includes(cleanActualRole)) {
    console.error("Tentativë mashtrimi: Roli nuk përputhet me Backend-in!");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;