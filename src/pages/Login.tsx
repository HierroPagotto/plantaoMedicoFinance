
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden md:flex bg-gradient-to-r from-medical-blue to-medical-purple items-center justify-center">
        <div className="p-8 max-w-lg text-white">
          <h1 className="text-4xl font-bold mb-6">Bem-vindo de volta</h1>
          <p className="text-lg opacity-90 mb-8">
            Organize seus plantões e monitore seus ganhos de forma simples e eficiente.
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <blockquote className="italic">
              "O Plantão Médico revolucionou a forma como organizo minha agenda e acompanho meus rendimentos. Não consigo mais trabalhar sem ele!"
            </blockquote>
            <div className="mt-4 font-medium">
              Dr. Carlos Ferreira
              <div className="text-sm opacity-75">Cardiologista</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Plantão Médico</h1>
            <p className="text-muted-foreground mt-2">Entre na sua conta</p>
          </div>
          <LoginForm />
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <Button variant="link" className="p-0" asChild>
                <Link to="/register">Cadastre-se</Link>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
