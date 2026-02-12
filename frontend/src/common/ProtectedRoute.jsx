import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../index'; // Axios instance jote

const ProtectedRoute = ({ allowedRoles }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [actualRole, setActualRole] = useState(null);
  const token = localStorage.getItem('auth_token');
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        // Pyesim backend-in per rolin e vertete
        const res = await api.get('/user-profile');
        setActualRole(res.data.role); 
      } catch (err) {
        console.error("Verifikimi dështoi", err);
        localStorage.removeItem('auth_token');
      } finally {
        setIsVerifying(false);
      }
    };
    verifyUser();
  }, [token]);

  if (isVerifying) {
    return <div>Duke verifikuar autorizimin...</div>; // Ose një Spinner
  }

  if (!token || !actualRole) {
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