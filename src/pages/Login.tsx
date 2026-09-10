import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0EA5E9] to-[#6EE7B7] flex items-center justify-center">
      <div className="container h-full flex">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 p-8 md:p-12"
        >
          <div className="bg-white/95 rounded-2xl shadow-xl border border-white/20 p-10">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Plantão Médico</h1>
                <p className="text-lg text-gray-600">Controle sua agenda e finanças com facilidade</p>
              </div>
              <div className="w-full max-w-md mx-auto">
                <LoginForm />
                <div className="mt-8 text-center space-y-2">
                  <p className="text-gray-600 text-sm">
                    Não tem uma conta?{" "}
                    <Button variant="link" className="p-0" asChild>
                      <Link to="/register" className="text-blue-600 hover:text-blue-700">Cadastre-se como profissional</Link>
                    </Button>
                  </p>
                  <p className="text-gray-600 text-sm">
                    É um hospital?{" "}
                    <Button variant="link" className="p-0" asChild>
                      <Link to="/hospital/register" className="text-blue-600 hover:text-blue-700">Cadastrar hospital</Link>
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;