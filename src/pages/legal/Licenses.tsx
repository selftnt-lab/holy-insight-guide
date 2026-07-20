import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageSeo from "@/components/PageSeo";

const Licenses = () => (
  <div className="min-h-screen pb-28">
    <PageSeo title="Licenças e créditos — RC Bible" description="Traduções bíblicas de domínio público, léxicos e bibliotecas open source utilizadas pelo RC Bible." path="/legal/licencas" />
    <div className="mx-auto max-w-2xl px-5 pt-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Voltar
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Licenças e créditos</h1>

      <article className="prose prose-sm dark:prose-invert mt-6 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-lg font-semibold">Traduções bíblicas</h2>
          <p>
            O texto bíblico exibido no aplicativo provém de traduções em <strong>domínio público</strong>:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>João Ferreira de Almeida (PT)</strong> — tradução clássica em domínio público,
              servida via bible-api.com.
            </li>
            <li>
              <strong>King James Version (EN)</strong> — domínio público.
            </li>
            <li>
              <strong>World English Bible (EN)</strong> — domínio público.
            </li>
            <li>
              <strong>American Standard Version, 1901 (EN)</strong> — domínio público.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Não utilizamos traduções que exigem licenciamento comercial.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">Léxico das línguas originais</h2>
          <p>
            Definições e códigos de palavras hebraicas, aramaicas e gregas são baseados em
            léxicos clássicos de domínio público (Strong, BDB, Thayer) com curadoria do app.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">Fontes de dados e tecnologia</h2>
          <ul className="list-disc pl-5">
            <li><a href="https://bible-api.com" target="_blank" rel="noreferrer" className="underline">bible-api.com</a> — texto bíblico em domínio público.</li>
            <li><strong>Supabase</strong> — autenticação, banco de dados e edge functions.</li>
            <li><strong>Lovable AI Gateway</strong> — acesso a modelos de inteligência artificial (família Google Gemini).</li>
            <li><strong>React, Vite, Tailwind CSS, shadcn/ui, framer-motion, lucide-react</strong> — bibliotecas open source.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">Inteligência artificial</h2>
          <p>
            O tutor de IA, estudos de capítulo, devocionais e planos personalizados são gerados por
            modelos de linguagem. As respostas buscam fidelidade ao texto bíblico, mas podem
            conter imprecisões. Sempre confira com o texto sagrado e com sua comunidade de fé.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold">Contato</h2>
          <p>
            Para reportar uso indevido de conteúdo ou solicitar atribuição:{" "}
            <a className="underline" href="mailto:contato@holyinsight.app">contato@holyinsight.app</a>.
          </p>
          <p className="text-xs text-muted-foreground">
            Veja também{" "}
            <Link to="/legal/termos" className="underline">Termos</Link> e{" "}
            <Link to="/legal/privacidade" className="underline">Privacidade</Link>.
          </p>
        </section>
      </article>
    </div>
  </div>
);

export default Licenses;
