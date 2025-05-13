import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '@/lib/api';

const Logout = () => {
  useEffect(() => {
    api.logout();
  }, []);

  return <Navigate to="/login" replace />;
};

export default Logout;