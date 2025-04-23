
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden md:flex bg-gradient-to-r from-medical-blue to-medical-purple items-center justify-center">
        <div className="p-8 max-w-lg text-white">
          <h1 className="text-4xl font-bold mb-6">Comece a organizar seus plantões</h1>
          <p className="text-lg opacity-90 mb-8">
            Gerencie seus plantões, acompanhe seus rendimentos e otimize sua carreira médica.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">+500</div>
              <div className="text-sm opacity-75">Médicos cadastrados</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">+5000</div>
              <div className="text-sm opacity-75">Plantões registrados</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">+100</div>
              <div className="text-sm opacity-75">Hospitais</div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-sm opacity-75">Avaliação média</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Plantão Médico</h1>
            <p className="text-muted-foreground mt-2">Crie sua conta</p>
          </div>
          <RegisterForm />
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Button variant="link" className="p-0" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
