
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDemoProfile } from '@/utils/demoProfileData';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Cria um perfil de demonstração
    if (!localStorage.getItem('doctorProfile')) {
      createDemoProfile();
    }
    
    // Redireciona para o dashboard
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecionando...</h1>
        <p className="text-muted-foreground mt-2">Aguarde, você será redirecionado para o dashboard.</p>
      </div>
    </div>
  );
};

export default Index;
