import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CONTACT = 'privacidade@medsinc.com.br';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Política de Privacidade</h1>
          <Button variant="outline" asChild>
            <Link to="/">Voltar</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Última atualização: setembro de 2026. Documento descritivo do tratamento de
          dados pessoais na plataforma MedSinc, em alinhamento com a Lei nº 13.709/2018
          (LGPD).
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">1. Controlador</h2>
          <p>
            A MedSinc trata dados pessoais para viabilizar gestão de plantões,
            financeiro e marketplace médico. Contato de privacidade:{' '}
            <a className="underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">2. Dados coletados</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Identificação: nome, e-mail, telefone, foto de perfil</li>
            <li>Dados profissionais: conselho (CRM/etc.), especialidade, certificações</li>
            <li>Dados financeiros de uso do serviço: plantões, valores, gastos, metas</li>
            <li>Dados técnicos: autenticação (token), preferências de notificação</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">3. Finalidades</h2>
          <p className="text-sm">
            Prestação do serviço contratado (agenda, finanças, candidaturas),
            autenticação, comunicações operacionais e melhoria da plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">4. Bases legais (orientação)</h2>
          <p className="text-sm">
            Em regra, execução de contrato / procedimentos preliminares e legítimo
            interesse operacional, além do consentimento quando aplicável (ex.:
            aceite no cadastro). Esta descrição não constitui parecer jurídico.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">5. Seus direitos</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Acesso e correção: Configurações / perfil autenticado</li>
            <li>Portabilidade: exportação JSON em Configurações</li>
            <li>Eliminação: exclusão da conta em Configurações (confirmação por e-mail e senha)</li>
            <li>Canal: {CONTACT}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">6. Segurança</h2>
          <p className="text-sm">
            Senhas com hash bcrypt, acesso via JWT, HTTPS em produção, CORS
            restrito, upload de foto autenticado e minimização de dados no perfil
            público. Detalhes técnicos estão descritos na documentação interna do
            projeto.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">7. Compartilhamento</h2>
          <p className="text-sm">
            Dados podem ser compartilhados com hospitais no contexto de candidaturas
            e gestão de plantões, na medida necessária à finalidade. Não vendemos
            dados pessoais.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4">
          Veja também os <Link className="underline" to="/terms">Termos de Uso</Link>.
        </p>
      </div>
    </div>
  );
}
