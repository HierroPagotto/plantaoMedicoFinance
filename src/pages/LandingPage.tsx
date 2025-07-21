import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Shield, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Clock,
  BarChart3,
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: "Gestão de Plantões",
      description: "Organize seus plantões de forma eficiente com calendário integrado e notificações automáticas."
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Acompanhe seus ganhos, despesas e recebimentos com relatórios detalhados e gráficos."
    },
    {
      icon: MapPin,
      title: "Hospitais Parceiros",
      description: "Conecte-se com uma rede de hospitais parceiros e encontre oportunidades de plantão."
    },
    {
      icon: Users,
      title: "Perfil Profissional",
      description: "Crie seu perfil profissional e conecte-se com outros médicos da comunidade."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados estão protegidos com criptografia de ponta e conformidade com LGPD."
    },
    {
      icon: TrendingUp,
      title: "Análise de Performance",
      description: "Acompanhe sua evolução profissional com métricas e insights personalizados."
    }
  ];

  const benefits = [
    "Organização completa dos seus plantões",
    "Controle financeiro em tempo real",
    "Conexão com hospitais parceiros",
    "Perfil profissional destacado",
    "Relatórios e análises detalhadas",
    "Suporte especializado 24/7"
  ];

  const testimonials = [
    {
      name: "Dr. Ana Silva",
      specialty: "Cardiologista",
      text: "O MedSinc revolucionou minha gestão de plantões. Agora consigo organizar tudo de forma muito mais eficiente.",
      rating: 5
    },
    {
      name: "Dr. Carlos Mendes",
      specialty: "Pediatra",
      text: "Excelente para controle financeiro. Os relatórios me ajudam a tomar melhores decisões sobre meus plantões.",
      rating: 5
    },
    {
      name: "Dra. Maria Santos",
      specialty: "Neurologista",
      text: "Interface intuitiva e funcionalidades que realmente fazem a diferença no dia a dia.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/680739ca-789e-4353-bfb4-973cfc120e15.png" 
              alt="MedSinc Logo" 
              className="h-10 w-auto" 
            />
            <span className="text-2xl font-bold text-medical-teal">MedSinc</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-medical-teal">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-medical-teal hover:bg-medical-accent text-white">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-medical-green text-white hover:bg-medical-greenLight">
            <Star className="w-4 h-4 mr-2" />
            Plataforma Completa para Médicos
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie seus{' '}
            <span className="text-medical-teal">plantões</span>
            <br />
            de forma inteligente
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Simplifique sua vida profissional com a plataforma que conecta médicos, 
            hospitais e oportunidades. Controle financeiro, gestão de plantões e muito mais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-medical-teal hover:bg-medical-accent text-white px-8 py-6 text-lg">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-medical-teal text-medical-teal hover:bg-medical-teal hover:text-white px-8 py-6 text-lg">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece todas as ferramentas necessárias para 
              otimizar sua carreira médica.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-medical-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-medical-teal" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-medical-teal">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-medical-greenLight">Médicos Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-medical-greenLight">Hospitais Parceiros</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-medical-greenLight">Plantões Gerenciados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-medical-greenLight">Avaliação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o MedSinc?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nossa plataforma foi desenvolvida por médicos, para médicos. 
                Entendemos suas necessidades e criamos soluções que realmente funcionam.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-medical-teal flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-medical-teal rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dashboard Intuitivo</h3>
                    <p className="text-gray-600">Visualize tudo em um só lugar</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Plantões do Mês</span>
                    <span className="font-semibold text-medical-teal">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Ganhos Previstos</span>
                    <span className="font-semibold text-medical-teal">R$ 8.500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Horas Trabalhadas</span>
                    <span className="font-semibold text-medical-teal">96h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600">
              Médicos que confiam no MedSinc para suas carreiras
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-medical-teal">{testimonial.specialty}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-medical-teal">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-xl text-medical-greenLight mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de médicos que já estão aproveitando os benefícios 
            do MedSinc. Comece hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-medical-teal hover:bg-gray-100 px-8 py-6 text-lg">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-medical-teal px-8 py-6 text-lg">
                Acessar Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/680739ca-789e-4353-bfb4-973cfc120e15.png" 
                  alt="MedSinc Logo" 
                  className="h-8 w-auto" 
                />
                <span className="text-xl font-bold">MedSinc</span>
              </div>
              <p className="text-gray-400">
                A plataforma completa para médicos gerenciarem suas carreiras de forma inteligente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Recursos</li>
                <li>Preços</li>
                <li>Integrações</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Privacidade</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MedSinc. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 