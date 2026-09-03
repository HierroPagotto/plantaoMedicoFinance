import { useEffect, useState } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import api from '@/lib/api';
import { AppShell } from '../layout/AppShell';
import { HospitalShell } from '../layout/HospitalShell';
import {
  DOCTOR_PROFILE_SETUP_PATH,
  isDoctorProfileComplete,
} from '@/lib/doctor-profile';

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
  const location = useLocation();

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
          return;
        }

        if (role === 'hospital_staff' && userRole !== 'hospital_staff') {
          setRedirectTo('/dashboard');
          setIsValid(false);
          return;
        }

        const isDoctorSide =
          role === 'doctor' &&
          (userRole === 'doctor' || userRole === 'platform_admin');

        if (
          isDoctorSide &&
          !isDoctorProfileComplete(response) &&
          location.pathname !== DOCTOR_PROFILE_SETUP_PATH
        ) {
          setRedirectTo(DOCTOR_PROFILE_SETUP_PATH);
          setIsValid(false);
          return;
        }

        setIsValid(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setRedirectTo('/login');
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [token, role, location.pathname]);

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
