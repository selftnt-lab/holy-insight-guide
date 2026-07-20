import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageSeo from "@/components/PageSeo";

const Terms = () => (
  <div className="min-h-screen pb-28">
    <PageSeo title="Termos de Uso — RC Bible" description="Termos de uso do aplicativo RC Bible: responsabilidades, uso aceitável e limitações do tutor de IA bíblica." path="/legal/termos" />
    <div className="mx-auto max-w-2xl px-5 pt-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Voltar
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Termos de Uso</h1>
      <p className="mt-1 text-xs text-muted-foreground">Última atualização: 10 de junho de 2026</p>

      <article className="prose prose-sm dark:prose-invert mt-6 max-w-none space-y-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-lg font-semibold">1. Sobre o Holy Insight Guide</h2>
          <p>
            O Holy Insight Guide é um aplicativo de leitura, estudo e devoção bíblica. Oferecemos
            ferramentas como leitura por capítulos, comparação de traduções, destaques, anotações,
            busca, estudo de palavras originais, planos de leitura e um tutor assistido por
            inteligência artificial. O uso do aplicativo implica a aceitação destes Termos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">2. Conta e responsabilidade</h2>
          <p>
            Você é responsável por manter suas credenciais em segurança e pelas ações realizadas
            em sua conta. Não compartilhe sua senha. Ao criar conta você declara ter idade
            suficiente para celebrar contrato segundo a legislação local.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">3. Uso aceitável</h2>
          <p>Você concorda em não:</p>
          <ul className="list-disc pl-5">
            <li>Utilizar o serviço para fins ilícitos ou para enganar terceiros;</li>
            <li>Abusar do tutor de IA para gerar conteúdo ofensivo, difamatório ou ilegal;</li>
            <li>Tentar contornar limites técnicos, autenticação ou medidas de segurança;</li>
            <li>Realizar engenharia reversa ou raspagem em massa do conteúdo.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">4. Conteúdo gerado por IA</h2>
          <p>
            Respostas do tutor, estudos de capítulo, devocionais e planos gerados por IA são
            ferramentas de apoio ao estudo bíblico. Embora façamos esforço para fidelidade ao texto
            sagrado, o conteúdo pode conter imprecisões. <strong>Ele não substitui</strong> o
            pastoreio presencial, o aconselhamento pastoral qualificado, nem atendimento
            médico, psicológico ou jurídico. Em situações de crise, procure ajuda profissional e
            sua comunidade de fé local.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">5. Conteúdo do usuário</h2>
          <p>
            Destaques, anotações, respostas de reflexão e planos pessoais permanecem seus. Ao
            armazená-los no app, você nos concede licença limitada para hospedar e exibir esse
            conteúdo apenas para você. Você pode excluir seus dados a qualquer momento pela
            página de perfil.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">6. Propriedade intelectual</h2>
          <p>
            Marca, código e identidade visual do Holy Insight Guide pertencem aos seus titulares.
            Traduções bíblicas e fontes de dados utilizadas estão listadas em{" "}
            <Link to="/legal/licencas" className="underline">Licenças e créditos</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">7. Disponibilidade</h2>
          <p>
            O serviço é fornecido "no estado em que se encontra". Podemos interromper, alterar ou
            descontinuar funcionalidades a qualquer momento. Não garantimos disponibilidade
            ininterrupta.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">8. Limitação de responsabilidade</h2>
          <p>
            Na máxima extensão permitida em lei, não somos responsáveis por danos indiretos,
            lucros cessantes, perda de dados ou consequências de decisões tomadas com base em
            conteúdo gerado por IA.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">9. Alterações</h2>
          <p>
            Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas pelo app ou por
            e-mail. O uso continuado após a alteração indica concordância.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">10. Contato</h2>
          <p>Dúvidas: <a className="underline" href="mailto:contato@holyinsight.app">contato@holyinsight.app</a>.</p>
        </section>
      </article>
    </div>
  </div>
);

export default Terms;
