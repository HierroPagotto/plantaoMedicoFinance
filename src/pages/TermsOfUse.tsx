import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Termos de Uso</h1>
          <Button variant="outline" asChild>
            <Link to="/">Voltar</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Última atualização: setembro de 2026.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">1. Aceite</h2>
          <p className="text-sm">
            Ao criar conta ou utilizar a MedSinc, você declara ter lido e aceito
            estes Termos e a{' '}
            <Link className="underline" to="/privacy">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">2. Serviço</h2>
          <p className="text-sm">
            A plataforma oferece ferramentas para organização de plantões,
            acompanhamento financeiro e marketplace de oportunidades entre
            profissionais e hospitais.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">3. Conta e responsabilidade</h2>
          <p className="text-sm">
            Você é responsável pela veracidade dos dados informados, pela guarda
            das credenciais e pelo uso adequado do sistema. Informações
            profissionais (conselho, especialidade) devem estar corretas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">4. Uso proibido</h2>
          <p className="text-sm">
            É vedado uso fraudulento, tentativa de acesso não autorizado, coleta
            abusiva de dados de terceiros ou qualquer conduta ilícita.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">5. Encerramento</h2>
          <p className="text-sm">
            Você pode solicitar a exclusão da conta pelas Configurações. A MedSinc
            pode suspender contas em caso de violação destes Termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">6. Contato</h2>
          <p className="text-sm">
            Dúvidas: privacidade@medsinc.com.br
          </p>
        </section>
      </div>
    </div>
  );
}
