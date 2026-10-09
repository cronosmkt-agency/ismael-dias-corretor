# 📱 Terephones — Documentação Completa do Sistema

> **Guia Técnico e Operacional Oficial**  
> Este documento reúne todas as informações sobre a arquitetura, funcionalidades, integrações, fluxo de dados e guia de manutenção do site da **Terephones** (iPhones Novos & Seminovos em Teresópolis - RJ).

---

## 📌 1. Localização no Computador & Repositório

- **Diretório do Projeto no Computador:**
  ```bash
  /home/zinma/Área de trabalho/Cronos/Projetos/Sites/projetos-gerados/terephones
  ```
- **Repositório Git Remoto:**
  - URL: `https://github.com/cronosmkt-agency/terephones.git`
  - Branch de Produção: `main`
- **Deploy & Hospedagem:**
  - Hospedado na **Vercel** com integração contínua (CI/CD).
  - Qualquer `git push origin main` compila e publica as atualizações automaticamente em menos de 1 minuto.
- **Porta padrão em Desenvolvimento Local:**
  - `http://localhost:8081` (ou `http://localhost:3000`)

---

## 🛠️ 2. Stack Tecnológica

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Framework Fullstack** | **TanStack Start** (`@tanstack/react-start`) | SSR (Server-Side Rendering) de alta performance com hidratação rápida em SPA. |
| **Roteamento** | **TanStack React Router** (`@tanstack/react-router`) | Roteamento baseado em arquivos com tipagem estática rigorosa e validação de rotas. |
| **Interface & Componentes**| **React 19** + **Tailwind CSS v4** + **Radix UI** | Componentes acessíveis, responsivos e estilização moderna com variáveis CSS dinâmicas. |
| **Servidor / Engine** | **Nitro** + **Vite** | Bundler ultra-rápido com compilação sob demanda e HMR (Hot Module Replacement). |
| **Ícones & Notificações** | **Lucide React** + **Sonner** | Ícones minimalistas em SVG e sistema de avisos flutuantes (*toasts*). |
| **Planilha em Tempo Real** | **Google Sheets CSV API** | Sincronização direta de estoque com planilhas públicas da Terephones. |
| **Atendimento Online** | **Tawk.to Live Chat API** | Widget nativo de chat em tempo real com bot interativo de suporte. |
| **Conversão de Vendas** | **WhatsApp Deep Linking** | Redirecionamento direto com parâmetros URL codificados com ficha do aparelho. |

---

## 📂 3. Estrutura de Pastas e Arquivos

```text
terephones/
├── DOCUMENTACAO_COMPLETA.md           # [Este arquivo] Documentação central do projeto
├── package.json                       # Dependências e scripts de automação
├── vite.config.ts                     # Configuração do Vite e plugins do TanStack Router
├── tsconfig.json                      # Configurações do compilador TypeScript
├── public/                            # Arquivos estáticos servidos diretamente (ícones, logos, favicons)
├── docs/                              # Documentos de apoio (prompts de fotos e anúncios para marketplace)
│   ├── ANUNCIOS_MARKETPLACE_FACEBOOK.md
│   ├── PROMPTS_MARKETPLACE_TEREPHONES.md
│   └── PROMPTS_POV_ESTOQUE_COMPLETO.md
└── src/
    ├── router.tsx                     # Ponto de entrada e configuração do TanStack Router
    ├── styles.css                     # Design tokens, temas (Black Piano / White), estilos globais
    ├── assets/
    │   └── devices/                   # Fotos em alta resolução e formato WebP otimizado de cada iPhone
    ├── components/                    # Componentes modulares reutilizáveis
    │   ├── BrandLogo.tsx              # Logotipo oficial Terephones (adaptável a claro/escuro)
    │   ├── CursorEffects.tsx          # Efeitos visuais refinados de iluminação do cursor
    │   ├── MobileBottomNav.tsx        # Barra de navegação inferior mobile (Início e Loja)
    │   ├── ProductDetailModal.tsx     # Modal completo com ficha técnica, fotos reais e botão de WhatsApp
    │   ├── SiteNavbar.tsx             # Barra de navegação superior (cápsula de vidro e seletor de tema)
    │   ├── SiteFooter.tsx             # Rodapé institucional com links, contatos e endereço
    │   ├── TawkFloatingWidget.tsx     # Carregador e gerenciador do chat flutuante Tawk.to
    │   ├── ThemeSelectorModal.tsx     # Seletor e switcher dos modos Black Piano e Branco
    │   ├── WhatsAppIcon.tsx           # Ícone vetorial oficial do WhatsApp
    │   └── WhatsFloat.tsx             # Botão flutuante fixo do WhatsApp com pulse online
    ├── data/
    │   └── storeData.ts               # Dados estáticos de fallback, reviews, telefones e lista de produtos
    ├── routes/                        # Páginas roteadas da aplicação
    │   ├── __root.tsx                 # Layout raiz com HTML, meta tags, schema.org e widgets globais
    │   ├── index.tsx                  # Página Inicial (Hero, Mais Pedidos, Diferenciais, Avaliações, FAQ)
    │   ├── loja.tsx                   # Catálogo completo (Filtros, Busca, Modo Grade/Vitrine, Ficha Técnica)
    │   └── chat.tsx                   # Rota legada de chat (redireciona automaticamente para /loja)
    └── services/
        └── googleSheets.ts            # Parser inteligente de CSV do Google Sheets e associação de fotos
```

---

## 🌟 4. Tudo o Que Foi Feito no Projeto (Histórico & Recursos)

### 4.1. Navegação Simplificada e Responsiva
- **Apenas "Início" e "Loja":** O menu foi enxugado para focar totalmente no catálogo e nas vendas, eliminando abas confusas ou redundantes.
- **Mobile Bottom Bar:** No celular, a barra inferior de navegação conta agora com apenas 2 abas grandes, ergonômicas e com ícones intuitivos (`Início` e `Loja`).
- **Redirecionamento Automático:** Caso algum cliente acerte um link antigo de `/chat`, o sistema executa um redirecionamento imediato e transparente para a `/loja`.

### 4.2. Fluxo de Vendas 100% Direto no WhatsApp
- **Remoção de intermediários:** Foi eliminado o sistema de simulação de compra em chat interno no site.
- **Botões "Pedir" e "Pedir no WhatsApp":** Todos os botões do site (nos cards de produto da página inicial, no catálogo da loja e dentro do modal de ficha técnica) montam automaticamente uma mensagem completa e abrem o WhatsApp oficial da Terephones:
  ```text
  Olá, equipe Terephones! Gostaria de pedir este iPhone que vi no site:

  📱 Aparelho: iPhone 17 Pro Max 256GB Azul
  💰 Valor à vista: R$ 7.590,00 (ou até 18x no cartão)
  💾 Capacidade: 256 GB
  ✨ Condição: Novo Lacrado de Fábrica Apple (1 Ano Garantia Mundial)

  Gostaria de confirmar a disponibilidade para entrega hoje em Teresópolis!
  ```

### 4.3. Prioridade Total para o iPhone 17 na Loja
- **iPhone 17 em 1º Lugar na Aba "Todos":** Toda a família de iPhone 17 (17 Pro Max, 17 Pro, 17 e 17e) foi programada para aparecer no topo absoluto da listagem, tanto nos dados padrão quanto nos dados ao vivo da planilha do Google Sheets.
- **Mais Pedidos da Semana Atualizados:** A seção de destaques da página inicial agora exibe prioritariamente os aparelhos mais desejados da atualidade: **iPhone 17 Pro Max**, **iPhone 17 Pro**, **iPhone 16 Pro Max** e **iPhone 16**.

### 4.4. Integração do Chat Flutuante Tawk.to Nativo
- **Widget ID Oficial:** Conectado à propriedade `6aac00529d89af3444bee888/1k2o8b0j4`.
- **Comportamento Original Mantido:** O chat funciona com seu formato nativo em card compacto (sem forçar tela cheia), exibindo as prévias de mensagens e respostas diretamente na tela do usuário.
- **Elevação Acima do Rodapé:** Foi configurado um espaçamento vertical dinâmico (`bottom: calc(...)`) para que o widget fique acima da barra de navegação no mobile, exatamente na mesma altura do botão do WhatsApp.

### 4.5. Botão Flutuante do WhatsApp (`WhatsFloat.tsx`)
- **Posicionamento Perfeito:** Posicionado no **canto inferior esquerdo** da tela, com indicador luminoso pulsante em verde e texto expansível no desktop *(Online agora — (21) 96463-9999)*.
- **Sem colisão:** O WhatsApp à esquerda e o Tawk.to à direita criam uma moldura simétrica e harmônica ao redor do conteúdo.

### 4.6. Sistema Neumórfico de Tema (Black Piano & Branco)
- **Modo Black Piano:** Fundo preto profundo e espelhado (`#05070c`), cartões com efeito de vidro fume, bordas sutis em azul néon e tipografia de alto contraste.
- **Modo Branco:** Visual clean e minimalista no padrão Apple Store.
- **Sem Piscar na Carga:** Script inline antes da hidratação do React no `<head>` previne o efeito de flash de tema incorreto (*FOUC*).

### 4.7. Limpeza Visual e Despoluição
- **Remoção do Popup de Entrega:** O popup flutuante que aparecia avisando sobre a entrega em 1h foi retirado para evitar poluição visual sobre a barra de navegação.
- **Remoção do Banner de Acessórios:** Foi retirado o card que ofertava o *Kit Essencial Proteção Total (capa + película + fonte)*, deixando a seção de diferenciais muito mais limpa e focada na credibilidade da loja.

---

## ⚡ 5. Como o Site Funciona (Lógica de Dados)

### 5.1. Sincronização com o Google Sheets (`src/services/googleSheets.ts`)
O site lê diretamente duas abas de uma planilha pública da Terephones no Google Docs:
1. **Aba de Seminovos (GID 0):**
   - URL: `https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv`
   - Campos lidos: Modelo, Capacidade, Cor, Saúde da Bateria, Valor à Vista, Valor Parcelado, Estado/Detalhes, etc.
2. **Aba de Lacrados (GID 2124590035):**
   - URL: `https://docs.google.com/spreadsheets/d/e/.../pub?gid=2124590035&single=true&output=csv`
   - Campos lidos: Modelo, Quantidade de unidades lacradas disponíveis, IMEIs vinculados, Garantia Apple de 1 ano.
3. **Agrupamento Automático:**
   - O algoritmo detecta aparelhos lacrados idênticos e os agrupa em um único card com badge de quantidade (ex: `📦 5 un. Lacradas`).
4. **Fallback Seguro:**
   - Se a internet oscilar ou o Google Sheets demorar a responder, o site utiliza instantaneamente os 28 aparelhos pré-compilados em `src/data/storeData.ts`, garantindo que o site nunca fique em branco ou fora do ar.

### 5.2. Mapeamento Inteligente de Imagens (`DEVICE_IMAGES`)
- Em `src/services/googleSheets.ts`, existe a função `getProductImageByModel(name)`.
- Ela lê o nome do aparelho e sua cor (ex: *"iPhone 17 Pro Max 256GB Azul"* ou *"Titânio Deserto"*) e seleciona automaticamente a imagem 3D em alta resolução e formato WebP da pasta `src/assets/devices/`.

---

## 💻 6. Comandos e Guia Operacional no Terminal

Para gerenciar o projeto no seu terminal Linux:

### 6.1. Abrir a pasta do projeto
```bash
cd "/home/zinma/Área de trabalho/Cronos/Projetos/Sites/projetos-gerados/terephones"
```

### 6.2. Iniciar o site em modo de desenvolvimento local
```bash
npm run dev -- --port 8081
```
> O site abrirá no endereço: **`http://localhost:8081`**

### 6.3. Testar a compilação de produção
```bash
npm run build
```
> Garante que não existem erros de TypeScript, links quebrados ou problemas de empacotamento antes de enviar para a Vercel.

### 6.4. Enviar atualizações para a Vercel (Deploy)
```bash
git add .
git commit -m "feat: descrição da melhoria realizada"
git push origin main
```
> Assim que o comando `git push origin main` finalizar, a Vercel iniciará o build automático e colocará o site no ar em segundos.

---

## 📞 7. Informações de Contato e Identidade da Loja

- **Nome da Loja:** Terephones — iPhones em Teresópolis
- **WhatsApp Oficial de Vendas:** `+55 (21) 96463-9999`
- **Exibição do Telefone no Site:** `(21) 96463-9999`
- **Instagram Oficial:** `@terephones` ([instagram.com/terephones](https://instagram.com/terephones))
- **Endereço do Ponto de Retirada Presencial:**
  - Loja Parceira **SejaDelta** (Centro de Teresópolis, RJ)
- **Horário de Atendimento Comercial:**
  - Segunda a Sábado: das 10:00 às 18:00
- **Diferenciais Chave:**
  - Entrega Express em até 1h na porta do cliente em qualquer bairro de Teresópolis.
  - Pagamento seguro somente no ato da entrega (após o cliente testar e conferir o iPhone na mão).
  - Garantia de 90 dias em seminovos revisados e 1 ano de garantia oficial Apple em novos lacrados.
  - Aceitação do iPhone usado na troca (Trade-In / Troca com Troco).

---

*Documentação gerada e atualizada em Setembro de 2026.*
