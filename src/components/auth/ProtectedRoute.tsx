import { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import api from '@/lib/api';
import { AppShell } from '../layout/AppShell';
import { HospitalShell } from '../layout/HospitalShell';

type RoleGate = 'doctor' | 'hospital_staff' | 'any';

const ProtectedRoute = ({
  children,
  role = 'doctor',
}: {
  children: JSX.Element;
  role?: RoleGate;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/login');
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getAuthMe();
        const userRole = response.role as string;
        localStorage.setItem('userData', JSON.stringify(response));

        if (role === 'doctor' && userRole === 'hospital_staff') {
          setRedirectTo('/hospital');
          setIsValid(false);
        } else if (role === 'hospital_staff' && userRole !== 'hospital_staff') {
          setRedirectTo('/dashboard');
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setRedirectTo('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [token, role]);

  if (isLoading) {
    if (role === 'hospital_staff') {
      return (
        <HospitalShell>
          <div className="flex h-64 items-center justify-center">
            <p>Carregando...</p>
          </div>
        </HospitalShell>
      );
    }
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Carregando...</p>
        </div>
      </AppShell>
    );
  }

  return isValid ? children : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
