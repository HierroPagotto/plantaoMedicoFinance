import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0EA5E9] to-[#6EE7B7]">
      <div className="container h-full flex">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 p-6 md:p-12"
        >
          <div className="w-full max-w-md mx-auto bg-white/95 rounded-2xl shadow-xl p-8">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Plantão Médico</h1>
                <p className="text-muted-foreground text-sm">Controle sua agenda e finanças com facilidade</p>
              </div>
              <div className="flex-1">
                <LoginForm />
              </div>
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Não tem uma conta?{" "}
                  <Button variant="link" className="p-0" asChild>
                    <Link to="/register">Cadastre-se</Link>
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;