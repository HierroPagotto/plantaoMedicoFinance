
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
        <img 
          src="/lovable-uploads/680739ca-789e-4353-bfb4-973cfc120e15.png" 
          alt="MedSinc Logo" 
          className="h-28 w-auto mx-auto mb-4 object-contain" 
        />
        <h1 className="text-2xl font-bold text-medical-teal">MedSinc</h1>
        <p className="text-muted-foreground mt-2">Aguarde, você será redirecionado para o dashboard.</p>
      </div>
    </div>
  );
};

export default Index;
