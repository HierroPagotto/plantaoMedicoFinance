import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0EA5E9] to-[#6EE7B7] flex items-center justify-center">
      <div className="container h-full flex">
        {/* Lado esquerdo - Depoimentos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 p-8 md:p-12"
        >
          <div className="relative bg-gradient-to-br from-[#0EA5E9]/10 to-[#6EE7B7]/10 rounded-2xl border border-white/20 shadow-xl p-10">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-6">O que os médicos dizem</h2>
                <div className="space-y-8">
                  <div className="p-6 bg-white/5 rounded-xl">
                    <blockquote className="text-xl italic text-gray-700">
                      "O Plantão Médico revolucionou a forma como organizo minha agenda e acompanho meus rendimentos. Não consigo mais trabalhar sem ele!"
                    </blockquote>
                    <div className="mt-4">
                      <span className="font-medium text-gray-800">Dr. Carlos Ferreira</span>
                      <div className="text-sm text-gray-600">Cardiologista</div>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-xl">
                    <blockquote className="text-xl italic text-gray-700">
                      "Finalmente um sistema que me ajuda a gerenciar meus plantões de forma profissional e intuitiva. Recomendo para todos os colegas!"
                    </blockquote>
                    <div className="mt-4">
                      <span className="font-medium text-gray-800">Dr. Ana Silva</span>
                      <div className="text-sm text-gray-600">Pediatria</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lado direito - Login */}
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
                <div className="mt-8 text-center">
                  <p className="text-gray-600 text-sm">
                    Não tem uma conta?{" "}
                    <Button variant="link" className="p-0" asChild>
                      <Link to="/register" className="text-blue-600 hover:text-blue-700">Cadastre-se</Link>
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