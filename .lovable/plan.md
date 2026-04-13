

# 📖 Guia Bíblico Inteligente — App Mobile-First

## Visão Geral
Aplicativo web mobile-first de estudo bíblico para iniciantes, com design minimalista inspirado em Apple + Duolingo, tom sereno e tecnológico.

## Design System
- **Fundo claro**: off-white (#F8F7F4), **Dark mode**: cinza-azulado (#1A1F2E)
- **Primária**: azul profundo (#1E3A5F), **Accent**: dourado suave (#C9A84C)
- **Tipografia**: Inter (UI), fonte serifada elegante (texto bíblico via Google Fonts — Lora ou Merriweather)
- **Bordas arredondadas**, sombras suaves, animações de transição com Framer Motion

## Navegação
- **Bottom Navigation Bar** fixa com 4 abas: Início, Leitura, Explorar, Perfil
- Transições suaves entre telas via React Router

## Telas

### 1. Tela Inicial (Dashboard)
- Saudação personalizada ("Bom dia, Maxwell") com progresso da trilha
- Card "Contexto do Dia" estilo story com imagem de fundo e botão play
- Botão grande "Continuar Leitura"
- Seção de progresso com barra visual

### 2. Tela de Leitura
- Texto bíblico limpo, espaçado, com fonte serifada
- Palavras-chave sublinhadas que ao clicar abrem **Bottom Sheet** (Drawer do shadcn) com dicionário visual rápido (significado, contexto cultural, imagem)
- **FAB** no canto inferior direito com ícone de faísca (Sparkles) — abre o Tutor IA

### 3. Tela do Tutor IA (Chat)
- Interface de chat moderna que se abre como sheet/overlay
- Mensagem inicial do bot pré-configurada
- Balões de mensagem estilizados (usuário vs bot)
- Input com opção de texto e ícone de microfone (visual, sem funcionalidade real por enquanto)

### 4. Tela Explorar
- Galeria de cards com imagens representando locais históricos
- Tags "Mapa 3D" e "Cultura" nos cards
- Layout em grid responsivo

### 5. Tela Perfil
- Avatar, nome, estatísticas de leitura
- Configurações básicas (tema claro/escuro toggle)

## Funcionalidades Técnicas
- Dark mode via toggle no perfil (classe CSS)
- Dados mockados para texto bíblico, dicionário e cards de exploração
- Framer Motion para animações de entrada e transição
- Componentes shadcn: Drawer, Card, Button, Sheet, Avatar, Badge, Progress
- Layout 100% mobile-first, responsivo

