import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageSeo from "@/components/PageSeo";

const Privacy = () => (
  <div className="min-h-screen pb-28">
    <PageSeo title="Privacidade — RC Bible" description="Política de privacidade do RC Bible: quais dados coletamos, como usamos e seus direitos sob a LGPD." path="/legal/privacidade" />
    <div className="mx-auto max-w-2xl px-5 pt-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Voltar
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Política de Privacidade</h1>
      <p className="mt-1 text-xs text-muted-foreground">Última atualização: 10 de junho de 2026</p>

      <article className="prose prose-sm dark:prose-invert mt-6 max-w-none space-y-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-lg font-semibold">1. Dados que coletamos</h2>
          <ul className="list-disc pl-5">
            <li><strong>Cadastro:</strong> e-mail, nome de exibição e, opcionalmente, avatar.</li>
            <li><strong>Uso do app:</strong> progresso de leitura, destaques, anotações, respostas de reflexão, planos ativos, preferências de tradução e tema.</li>
            <li><strong>Interações com a IA:</strong> mensagens enviadas ao tutor (histórico das últimas conversas), perguntas reflexivas respondidas, estudos gerados.</li>
            <li><strong>Técnicos:</strong> data e horário de acesso, IP (somente em logs do servidor por período curto), navegador.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">2. Para que usamos</h2>
          <ul className="list-disc pl-5">
            <li>Operar e personalizar a sua experiência de leitura e estudo.</li>
            <li>Salvar progresso e devolvê-lo entre dispositivos.</li>
            <li>Fornecer respostas do tutor e estudos personalizados via IA.</li>
            <li>Proteger o serviço contra abusos e fraudes.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">3. Base legal (LGPD)</h2>
          <p>
            Tratamos dados com base em execução de contrato (oferecer o serviço), consentimento
            (criação de conta) e legítimo interesse (segurança e melhoria).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">4. Compartilhamento</h2>
          <p>
            Não vendemos dados. Compartilhamos apenas com fornecedores essenciais ao funcionamento:
            provedor de banco/auth (Supabase), provedor de IA via AI Gateway (modelos
            Google Gemini) e API pública de texto bíblico (bible-api.com). Esses parceiros tratam
            os dados conforme suas próprias políticas, restritos à finalidade descrita aqui.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">5. Retenção</h2>
          <p>
            Mantemos seus dados enquanto a conta estiver ativa. Você pode solicitar exclusão a
            qualquer momento; após confirmação, todos os dados pessoais são removidos em até 30
            dias, exceto registros mínimos exigidos por lei.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">6. Seus direitos</h2>
          <p>
            Você pode acessar, corrigir, exportar ou excluir seus dados, revogar consentimentos e
            opor-se a tratamentos específicos. Entre em contato via{" "}
            <a className="underline" href="mailto:contato@holyinsight.app">contato@holyinsight.app</a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">7. Segurança</h2>
          <p>
            Adotamos criptografia em trânsito (HTTPS), autenticação por JWT, regras de acesso por
            linha no banco (RLS) e armazenamento isolado por usuário. Nenhum sistema é 100%
            seguro; comunicamos incidentes relevantes conforme exigido em lei.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">8. Crianças</h2>
          <p>
            O serviço não é direcionado a menores de 13 anos. Caso identifiquemos cadastro
            indevido, a conta será removida.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">9. Alterações</h2>
          <p>
            Podemos atualizar esta política. Mudanças relevantes serão comunicadas pelo app.
            Veja também{" "}
            <Link to="/legal/termos" className="underline">Termos de Uso</Link> e{" "}
            <Link to="/legal/licencas" className="underline">Licenças e créditos</Link>.
          </p>
        </section>
      </article>
    </div>
  </div>
);

export default Privacy;
