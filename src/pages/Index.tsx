
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarCheck, DollarSign, FileBarChart2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <header className="bg-gradient-to-r from-medical-blue to-medical-purple text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
              Plantão Médico
            </h1>
            <p className="text-lg md:text-xl opacity-90 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Gerencie seus plantões e monitore seus ganhos com facilidade
            </p>
            <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="lg" className="bg-white text-medical-blue hover:bg-white/90">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <img 
                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9jdG9yJTIwd2l0aCUyMHRhYmxldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                alt="Médico usando aplicativo"
                className="rounded-md shadow-md w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades principais</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <CalendarCheck className="h-8 w-8 text-medical-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de plantões</h3>
              <p className="text-muted-foreground">Registre seus plantões com todos os detalhes necessários: local, horário, especialidade e valor.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-medical-green" />
              </div>
              <h3 className="text-xl font-bold mb-2">Controle financeiro</h3>
              <p className="text-muted-foreground">Acompanhe seus ganhos, veja estatísticas detalhadas e planeje melhor suas finanças.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <FileBarChart2 className="h-8 w-8 text-medical-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2">Relatórios detalhados</h3>
              <p className="text-muted-foreground">Exporte relatórios em PDF e Excel para manter um histórico organizado de seus plantões.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-medical-green/20 to-medical-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a organizar seus plantões hoje mesmo</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de médicos que já estão otimizando sua rotina de trabalho com o Plantão Médico.
          </p>
          <Button asChild size="lg" className="bg-medical-blue hover:bg-medical-blue/90">
            <Link to="/register">Criar conta gratuitamente</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Plantão Médico</h2>
              <p className="text-sm opacity-75">© 2023 Todos os direitos reservados</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:text-medical-blue transition-colors">Política de Privacidade</a>
              <a href="#" className="text-sm hover:text-medical-blue transition-colors">Termos de Serviço</a>
              <a href="#" className="text-sm hover:text-medical-blue transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
