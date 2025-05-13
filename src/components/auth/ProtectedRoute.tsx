import { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import api from '@/lib/api';
import { AppShell } from '../layout/AppShell';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const verifyAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.getMyData();
                localStorage.setItem('userData', JSON.stringify(response));
                
                setIsValid(true);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [token]);

    if (isLoading) {
        return (
          <AppShell>
            <div className="flex items-center justify-center h-64">
              <p>Carregando...</p>
            </div>
          </AppShell>
        );
      }

    return isValid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;