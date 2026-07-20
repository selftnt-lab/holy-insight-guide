import React from "react";

const PlanningPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl font-bold text-foreground">
          Planejamento de Migração e Qualidade
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          atrávés de um planejamento robusto, planeje a migração desse aplicativo para a plataforma IOS inicialmente.
        </p>
      </div>

      <div className="w-full bg-card p-8 rounded-2xl border shadow-sm space-y-6">
        <h2 className="text-2xl font-serif font-semibold">Infraestrutura de Testes e RLS</h2>
        <p className="text-lg leading-relaxed text-foreground/80">
          Adicionar a suíte pgTAP ao meu pipeline de CI para garantir que as regras RLS continuam aprovadas após cada mudança. Criar testes automatizados que validem que inserts e updates em user_document_refs e client_error_logs só funcionam quando a ownership estiver correta.
        </p>
        
        <div className="pt-4 border-t">
          <p className="text-lg font-bold text-primary uppercase tracking-wide">
            EXECUTAR O PLANO DE MIGRAÇÃO, TANTO PARA IOS QUANTO PARA GOOGLE.
          </p>
        </div>

        <div className="pt-4 border-t space-y-4">
          <p className="text-sm text-muted-foreground italic">
            confirmo, pode ocultar o badge.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Aqui temos imagens de uma ideia de layout alternativa para nossa aplicação. Eu acho muito exagerado nos aspectodia de tecnologia, porém faria alguns ajustes mjuito pontuais. Comparando com nosso layout hoje, conseguiriamos consolidar um meio termo entre essas ideias que te mandei e o que temos pronto? Se sim, mande um plano, porém deve ser estritamente visual, nenhum botão, container pode ser removido do lugar. Sriam meras alterações de cores, gráficos, cards, sem mexer em nada na estrutura do aplicativo.
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary mb-2">Solicitação de Plano Visual:</p>
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              "traga um plano completo dessas alterações, mencione uma por uma das alterações que voce ira propor"
            </p>
          </div>
        </div>
    </div>
  );
};

export default PlanningPage;
