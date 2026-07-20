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
      </div>
    </div>
  );
};

export default PlanningPage;
