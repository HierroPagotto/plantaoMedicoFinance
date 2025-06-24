import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0EA5E9] to-[#6EE7B7]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md p-6"
            >
                <div className="bg-white/95 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Plantão Médico</h1>
                        <p className="text-muted-foreground text-sm">Crie sua conta</p>
                    </div>
                    <RegisterForm />
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Já tem uma conta?{" "}
                            <Button variant="link" className="p-0" asChild>
                                <Link to="/login">Entrar</Link>
                            </Button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;