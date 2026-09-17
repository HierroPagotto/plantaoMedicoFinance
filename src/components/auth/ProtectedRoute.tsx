import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { AppShell } from '../layout/AppShell';
import { HospitalShell } from '../layout/HospitalShell';
import { PageLoading } from '@/components/ui/PageLoading';
import {
  DOCTOR_PROFILE_SETUP_PATH,
  isDoctorProfileComplete,
  type DoctorProfileLike,
} from '@/lib/doctor-profile';

type RoleGate = 'doctor' | 'hospital_staff' | 'any';

type AuthSnapshot = {
  isValid: boolean;
  redirectTo: string;
};

function readCachedUser(): (DoctorProfileLike & { role?: string; is_admin?: boolean }) | null {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function evaluateAuth(
  user: DoctorProfileLike & { role?: string },
  role: RoleGate,
  pathname: string
): AuthSnapshot {
  const userRole = user.role as string | undefined;

  if (role === 'doctor' && userRole === 'hospital_staff') {
    return { isValid: false, redirectTo: '/hospital' };
  }

  if (role === 'hospital_staff' && userRole !== 'hospital_staff') {
    return { isValid: false, redirectTo: '/dashboard' };
  }

  const isDoctorSide =
    role === 'doctor' && (userRole === 'doctor' || userRole === 'platform_admin');

  if (
    isDoctorSide &&
    !isDoctorProfileComplete(user) &&
    pathname !== DOCTOR_PROFILE_SETUP_PATH
  ) {
    return { isValid: false, redirectTo: DOCTOR_PROFILE_SETUP_PATH };
  }

  return { isValid: true, redirectTo: '/login' };
}

function getInitialAuth(role: RoleGate, pathname: string): {
  loading: boolean;
  valid: boolean;
  redirectTo: string;
} {
  const token = localStorage.getItem('token');
  if (!token) {
    return { loading: false, valid: false, redirectTo: '/login' };
  }

  const cached = readCachedUser();
  if (!cached?.role) {
    return { loading: true, valid: false, redirectTo: '/login' };
  }

  const snapshot = evaluateAuth(cached, role, pathname);
  // Já autenticado em cache: renderiza na hora e revalida em background
  return {
    loading: false,
    valid: snapshot.isValid,
    redirectTo: snapshot.redirectTo,
  };
}

const ProtectedRoute = ({
  children,
  role = 'doctor',
}: {
  children?: JSX.Element;
  role?: RoleGate;
}) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const initial = getInitialAuth(role, location.pathname);
  const [isLoading, setIsLoading] = useState(initial.loading);
  const [isValid, setIsValid] = useState(initial.valid);
  const [redirectTo, setRedirectTo] = useState(initial.redirectTo);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      if (!token) {
        if (!cancelled) {
          setIsValid(false);
          setRedirectTo('/login');
          setIsLoading(false);
        }
        return;
      }

      const cached = readCachedUser();
      if (cached?.role) {
        const snapshot = evaluateAuth(cached, role, location.pathname);
        if (!cancelled) {
          setIsValid(snapshot.isValid);
          setRedirectTo(snapshot.redirectTo);
          setIsLoading(false);
        }
      } else if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const response = await api.getAuthMe();
        if (cancelled) return;

        localStorage.setItem('userData', JSON.stringify(response));
        const snapshot = evaluateAuth(response, role, location.pathname);
        setIsValid(snapshot.isValid);
        setRedirectTo(snapshot.redirectTo);
      } catch {
        if (cancelled) return;
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setRedirectTo('/login');
        setIsValid(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    verifyAuth();
    return () => {
      cancelled = true;
    };
  }, [token, role, location.pathname]);

  if (isLoading) {
    if (role === 'hospital_staff') {
      return (
        <HospitalShell>
          <PageLoading />
        </HospitalShell>
      );
    }
    return (
      <AppShell>
        <PageLoading />
      </AppShell>
    );
  }

  return isValid ? children ?? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
