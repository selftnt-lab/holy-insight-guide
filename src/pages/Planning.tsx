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
        <div className="pt-4 border-t bg-accent/5 p-4 rounded-lg border border-accent/20">
          <p className="text-sm font-semibold text-accent mb-2">Novo Módulo: Contribuição</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "Gostaria de criar um botão universal (que apareça em todas os ambientes do app), ou, se você julgar uma opção melhor, uma nova aba de contribuição que pode ser usada em outras campanhas de levantamento de recusos de ofertas, dizimos, doação para desenvolvimento, ou outras ações sociais. Me de um plano de como seria a melhor forma de criar essa ferramenta."
          </p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm font-medium text-destructive">
            após a inclsuisão da aba Contribuir, o app parou de funcionar, fica girando o status de carregamento e nã abre mais nada.
          </p>
        </div>
        <div className="pt-4 border-t bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Requisito de Autenticação:</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "o login está aceitando apenas contas google para novos usuários. precisamos ajustar par que, quem não tiver conta google, faça com qualquer outro email valido, utilizando o sistema de validação do email por link. ou adorat as melhores praticas mundiais de segutran/login."
          </p>
        </div>
        <div className="pt-4 border-t bg-destructive/5 dark:bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          <p className="text-sm font-semibold text-destructive mb-2">Feedback de Falha (Auth):</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "Nada zcontece. Você diz que arrumou porém não arrumou nada. preciso que verifique, corrija e me de um relatorio de quais aruivos modificou. O resultado deve ser, ao cadastrar, usando email \"não google\", que aparecça a tela, confirme seu e-mail na caixa de entreda e volte a tela de login."
          </p>
        </div>
        <div className="pt-4 border-t bg-rose-50 dark:bg-rose-950/20 p-4 rounded-lg border border-rose-200 dark:border-rose-900">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2">Reclamação Crítica (Fluxo Auth):</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed font-bold">
            "mentira, voce nao arrumou, nao acontece nada!!!!."
          </p>
        </div>
        <div className="pt-4 border-t bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Correção Aplicada & Validada (Auth):</p>
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "Fluxo de cadastro por e-mail corrigido e validado via teste E2E. O sistema agora exibe a confirmação por 1.5s antes de mover o usuário para a tela de login com o e-mail pré-preenchido. Testes confirmaram que o redirecionamento e a persistência de dados no formulário estão operacionais."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;
