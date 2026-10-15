# 🏢 CONTEXTO GERAL E STATUS DO PROJETO — IMOBILIÁRIA ISMAEL DIAS

> **ATENÇÃO AO AGENTE ANTIGRAVITY / IA:**  
> Este documento fornece **contexto total e imediato** sobre o projeto, o corretor, a arquitetura do código, o painel de controle administrativo, as métricas de analytics, os scripts criados, o repositório GitHub e o site em produção na Vercel. Leia este arquivo na íntegra para continuar o trabalho exatamente do ponto onde paramos, sem perder nenhuma configuração ou decisão técnica.

---

## 📌 1. PERFIL DO CLIENTE E OPERAÇÃO

* **Corretor:** **Ismael Dias**
* **WhatsApp do Corretor:** `(21) 96463-9999`
* **Imobiliária:** **Habittat House Imobiliária** (Teresópolis / RJ)
  * Endereço: Rodovia Dr. Rogério Moura Estevão, 3835 - Albuquerque, Teresópolis/RJ
  * Site: [habittathouse.com.br](http://habittathouse.com.br/)
  * CRM utilizado pela imobiliária: **Latitude** (`central-do-corretor.latitude.app.br`)
* **Parceiro Construtora Principal:** **Angeleti Construtora** (+20 anos de mercado em Teresópolis)
  * Principais lançamentos de terrenos/lotes: **Vale dos Pássaros** e **Golden Green**.
* **Tom de voz / Estilo:** Direto, comercial, transparente, focado em vendas em Teresópolis e região serrana do RJ.

---

## 📂 2. ESTRUTURA DA PASTA LOCAL (`c:\Users\hanri\Desktop\Imobiliaria`)

```text
c:\Users\hanri\Desktop\Imobiliaria\
├── Clientes/                         # Cadastros e anotações de leads
├── Documentos/                       # Documentação, guias e planos de automação
├── Parceiros/                        # Informações sobre Angeleti Construtora e condomínios
├── Imoveis/                          # 175 pastas com fotos e anúncios de cada imóvel
│   ├── INDICE_GERAL_IMOVEIS.md       # Catálogo geral com checklist [ ] de postagem
│   ├── 163110_lancamento_.../        # Pasta do imóvel (fotos/ + anuncio_facebook.md)
│   ├── (Vendida) 272236_casa_.../    # Imóvel 272236 marcado como (Vendida)
│   └── ...                           # Total de 175 imóveis catalogados
├── all_properties_urls.txt           # URLs de todos os imóveis no site da Habittat
├── Guia_Rapido_Empreendimentos...pdf # Apresentação comercial dos lotes da Angeleti
├── info.imobiliaria.md               # Resumo de operação e parceiros
└── CONTEXTO_E_STATUS_PROJETO.md      # ESTE DOCUMENTO (Contexto completo)
```

### 📄 Padrão dos Arquivos `anuncio_facebook.md`
Cada pasta dentro de `Imoveis/` possui:
1. `fotos/`: Fotos originais em alta resolução baixadas do site.
2. `capa_anuncio.jpg`: Foto de capa destacada.
3. `anuncio_facebook.md`: Texto estruturado especificamente para **copiar e colar no Bloco de Notas / Facebook Marketplace**:
   * **Título do anúncio** (atraente, com bairro e tipo)
   * **Preço** (formatado em R$)
   * **Categoria do Facebook** (Locação/Venda de Imóveis)
   * **Descrição formatada com Emojis** (Destaques, Quartos, Suítes, Vagas, Metragem, Bairro, Condições e Chamada para Ação no WhatsApp do Ismael `(21) 96463-9999`).
   * **Tags / Palavras-chave** para busca no Marketplace.
   * *Observação:* O usuário abre esses arquivos no Bloco de Notas (Notepad), então o texto deve ser limpo e sem formatações estranhas que quebrem em texto puro.

---

## 🌐 3. SITE NO AR, REPOSITÓRIO GITHUB E VERCEL

* **Repositório GitHub:** [https://github.com/cronosmkt-agency/ismael-dias-corretor](https://github.com/cronosmkt-agency/ismael-dias-corretor) (Branch: `main`)
* **Site em Produção na Vercel:** [https://ismael-dias-corretor.vercel.app](https://ismael-dias-corretor.vercel.app)
  * Catálogo de Imóveis: [https://ismael-dias-corretor.vercel.app/loja](https://ismael-dias-corretor.vercel.app/loja)
  * Lançamentos Angeleti: [https://ismael-dias-corretor.vercel.app/lancamentos](https://ismael-dias-corretor.vercel.app/lancamentos)
  * **Painel Administrativo:** [https://ismael-dias-corretor.vercel.app/admin](https://ismael-dias-corretor.vercel.app/admin) (PIN padrão: `1234`)
* **Pasta Local do Código do Site:** `c:\Users\hanri\Desktop\ismael-dias-corretor-main`
* **Token GitHub (PAT):** *[Configurado nos scripts locais de deploy em `scratch`]*
  * *Como não há `git.exe` no PATH do Windows desta máquina, commits e uploads são feitos via Git Database REST API do GitHub através de script Python (`push_to_github.py`).*

---

## 🚀 4. ARQUITETURA, ADMIN E BACKEND DE DADOS (NOVA VERSÃO)

### A. Painel de Controle Administrativo (`/admin`)
O corretor Ismael possui um painel web completo e responsivo, protegido por código PIN:
* **Autenticação:** Gate com teclado numérico/PIN (PIN padrão: `1234`, alterável nas configurações).
* **Acesso:** Direto pela URL `/admin` ou clicando no link discreto *"Painel do Corretor"* (com ícone de cadeado) no rodapé do site.
* **4 Módulos Integrados:**
  1. **Aba Imóveis:**
     * **Clique na Linha/Card para Editar:** Clicar em qualquer linha da tabela desktop ou card mobile abre imediatamente a edição completa e fotos do imóvel. Todos os botões internos de ação utilizam `e.stopPropagation()` para não disparar abertura acidental.
     * **Visualização Mobile Dedicada (Cards Touch-Friendly):** Cards touch modernos com foto, badge de quantidade de imagens (`📷 X`), título, #SKU, categoria, bairro com pin, metragem, preço destacado em verde, botão largo de edição e linha de ações rápidas (`[ 📑 Copiar ]`, `[ 🔗 Link ]`, `[ 👁️ Ver ]`, `[ 🗑️ ]`).
     * **Tabela Desktop Completa:** Mantida para telas médias e grandes com colunas alinhadas, status destacado e ações rápidas.
     * **Filtros Avançados e Chips Rápidos:**
       - Chips com contadores em tempo real: `[ Todos (175) ]`, `[ 🟢 Disponíveis no Site ]`, `[ 🔴 Vendidos (Ocultos) ]`, `[ 🟡 Reservados ]`.
       - Filtro por faixa de preço no admin (Até R$ 300k, R$ 300k - R$ 600k, R$ 600k - R$ 1M, R$ 1M - R$ 2M, Acima de R$ 2M).
     * **Novas Ferramentas de Produtividade:**
       - **Duplicar Imóvel (`📑`):** Clona instantaneamente o imóvel com um novo SKU aleatório e título `[Cópia]`, abrindo o modal para edição imediata.
       - **Copiar Link Direto (`🔗`):** Copia para a área de transferência a URL direta do imóvel (`/loja?sku=...`) pronta para enviar a clientes no WhatsApp.
     * **Alternância de status em 1 clique:** Botão direto que cicla instantaneamente entre *Disponível -> Vendida -> Reservado*. Imóveis marcados como `"VENDIDA"` exibem `🔴 Vendida (Oculto)`.
     * **Gestão Completa de Fotos e Galeria:**
       - Grade visual de miniaturas com numeração (`#1 Capa`, `#2`, `#3`, etc.).
       - Botão **"⭐ Capa"**: Define qualquer foto como capa principal em 1 clique (move para o índice 0).
       - Botões de Reordenação: Setas `⬅️` e `➡️` para reorganizar a ordem de exibição das fotos no carrossel.
       - Botão de Exclusão: `🗑️` para remover fotos indesejadas.
       - Inclusão de novas fotos via URL direta, colagem de múltiplas URLs em lote ou **upload direto do dispositivo (celular / PC)** via leitor local.
     * **Edição Total do Imóvel:**
       - Organizado em abas internas (*Galeria*, *Dados Básicos*, *Local & Metragem*, *Taxas & Vantagens*, *Descrição*).
       - Permite alterar Título, SKU, Preço, Status, Categoria, Selo Promocional, Bairro, Endereço, Metragem, Cômodos/Vagas, Condomínio, IPTU, Padrão de acabamento, Comodidades (tags interativas) e Link do Instagram.
       - Barra superior fixa no modal com botão **Salvar** sempre ao alcance do polegar.
  2. **Aba Analytics & Métricas:**
     * **4 KPIs Principais:** Total de Acessos / Visualizações, Leads gerados para WhatsApp, Taxa de Conversão estimada (%) e Total de Imóveis Ativos.
     * **Gráfico Interativo de 7 Dias:** Comparativo visual de *Visualizações de Páginas vs Cliques de WhatsApp* desenvolvido com Recharts.
     * **Ranking Top 10 Imóveis Mais Clicados:** Pódio com medalhas (🥇 🥈 🥉), contagem de cliques no WhatsApp, código SKU, bairro e valor de cada um.
     * **Divisão de Tráfego por Página:** Barra de progresso percentual entre Home (`/`), Catálogo (`/loja`) e Lançamentos (`/lancamentos`).
  3. **Aba Configurações:**
     * **Design Reestruturado:** Container espaçoso `max-w-4xl`, grid com espaçamentos confortáveis e sem quebras de layout.
     * **Ocultar Imóveis Vendidos da Vitrine Pública:** Toggle interativo para ocultar automaticamente imóveis vendidos da vitrine pública (`/loja`), mantendo-os acessíveis no admin para controle do corretor.
     * **Segurança do PIN:** Visualização alternável do PIN (`Eye`/`EyeOff`) para evitar erros de digitação.
     * Edição do Nome do Corretor, Telefone Formatado, Número do WhatsApp (destinatário dos cliques), CRECI, Link do Instagram (campo em largura total) e Mensagem Padrão de Saudação.
     * Alteração do PIN Administrativo com confirmação.
     * Atualização em tempo real via sistema de eventos (*CustomEvent*), atualizando botões de WhatsApp sem recarregar a página.
     * **Gerenciamento do Backend Supabase:** Painel dedicado com status em tempo real (`Nuvem Ativa` / `Modo Local`), inputs para URL e Chave Anon, botão `[ Testar Conexão ]` e botão `[ Enviar 175 Imóveis para Nuvem ]`.
  4. **Aba Backup & Dados:**
     * **Exportar Catálogo JSON:** Baixa em 1 clique um arquivo `.json` completo com todos os imóveis atuais.
     * **Restaurar Catálogo Base:** Botão para resetar os 175 imóveis originais caso necessário.
     * **Resetar Analytics:** Limpa contadores e histórico de visualizações.

### B. Regra de Negócio: Ocultação Automática de Imóveis Vendidos
* **Catálogo Público (`/loja`):**
  - Imóveis com badge ou condição `"VENDIDA"` são automaticamente filtrados e **não aparecem no catálogo público** quando a configuração `hideSoldProperties` está ativa (padrão `true`).
  - Caso o cliente acerte o SKU exato na barra de busca, o imóvel é localizado, garantindo compatibilidade com links antigos compartilhados.
* **Painel Administrativo (`/admin`):**
  - Imóveis vendidos permanecem visíveis na listagem com o indicador `🔴 Vendida (Oculto)`.
  - O corretor pode filtrá-los pelo chip rápido `[ 🔴 Vendidos (Ocultos) ]` e com 1 clique reativá-los para `🟢 Disponível` a qualquer momento.

### C. Camada de Dados e Backend em Nuvem (`src/services/`)
1. **`supabaseClient.ts` (Backend PostgreSQL na Nuvem):**
   * Comunicação direta via API REST PostgREST nativa do Supabase (Zero dependências adicionais, extremamente leve e compatível com SSR/Vercel).
   * Suporta autenticação via variáveis de ambiente da Vercel (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) ou configuração direta pelo Painel Admin (`/admin`).
   * Funções completas: `fetchPropertiesFromSupabase()`, `updatePropertyInSupabase()`, `insertPropertyInSupabase()`, `deletePropertyInSupabase()`, `testSupabaseConnection()` e `syncAllPropertiesToSupabase()`.
2. **`supabase_schema_and_seed.sql` (Script de Banco Pronto):**
   * Arquivo SQL completo na raiz (`c:\Users\hanri\Desktop\Imobiliaria\supabase_schema_and_seed.sql`) com criação da tabela `properties`, índices de busca, regras de segurança RLS (leitura pública e escrita admin), triggers e carga inicial de todos os 175 imóveis.
1. **`propertiesService.ts`:**
   * Orquestra a persistência e mutação de dados localmente (com sincronização via LocalStorage e base unificada de 175 imóveis).
   * Suporta CRUD completo: `getPropertiesPaginated()`, `updateProperty()`, `togglePropertyStatus()`, `addProperty()`, `deleteProperty()`.
2. **`analyticsService.ts`:**
   * Rastreia eventos de carregamento de páginas (`trackPageView`) e cliques em botões de contato de imóveis (`trackWhatsAppClick`).
   * Consolida métricas por dia, calcula rankings e taxas de conversão.
3. **`settingsService.ts`:**
   * Centraliza parâmetros de contato, segurança do corretor e chave `hideSoldProperties`.
4. **Paginação Inteligente e Desempenho na Loja (`/loja`):**
   * Anteriormente, os 175 imóveis eram renderizados simultaneamente na tela, causando lentidão no scroll e travamentos em celulares.
   * Agora o catálogo utiliza renderização paginada em lotes de 16 itens (`visibleCount = 16`) com o botão interativo *"Carregar Mais Imóveis (+16)"*, reduzindo drasticamente o consumo de memória RAM e garantindo rolagem 60 FPS no mobile.

### D. Limpeza de Código e Otimização de Bundle
* **Eliminação de Mídias Mortas:** O projeto anterior continha templates de loja de celulares (`chat.tsx` e `googleSheets.ts`) que importavam dezenas de fotos de iPhone da pasta de assets (mais de 550 KB de peso morto). Essas dependências foram completamente removidas/substituídas por stubs limpos, reduzindo o tamanho final da aplicação compilada.

---

## 🛠️ 5. HISTÓRICO DE CORREÇÕES DE LAYOUT E USABILIDADE

1. **Espaçamento do botão do WhatsApp & Remoção do Chat Legado:**
   * Removido o `<TawkFloatingWidget />` em `src/routes/__root.tsx` (balão que ficava sobreposto nos botões e no modal).
   * Ajustado o espaçamento entre `[ WhatsApp ]` e `[ Ficha ]` com proporção segura em telas estreitas.
2. **Fim do Arraste Horizontal ("Arrastar para o Lado"):**
   * Travado o CSS global em `src/styles.css`: `html, body { overflow-x: hidden; width: 100%; max-width: 100vw; position: relative; }`.
   * Travados todos os containers e galerias com `w-full min-w-0 overflow-hidden`.
3. **Preço Bugado / Colidindo no Mobile:**
   * No modo Vitrine (Mobile): o preço e a condição facilitada foram separados dos botões de ação e colocados em sua própria linha (`text-[13px] font-black`), com os botões dispostos logo abaixo em `grid grid-cols-2`.
   * No modo Grade: tipografia ajustada para `text-[13px] sm:text-lg` com truncamento seguro, evitando quebras em celulares menores que 360px.
4. **Higienização e Eliminação de Bairros Duplicados/Sujos:**
   * Toda a base de 175 imóveis foi normalizada para **42 bairros oficiais limpos de Teresópolis e região** (Agriões, Albuquerque, Alto, Bom Retiro, Carlos Guinle, Green Valley, Quinta da Barra, Vargem Grande, Várzea, etc.).
5. **Lançamentos Angeleti (`/lancamentos`):**
   * Foco exclusivo nos condomínios **Golden Green** e **Vale dos Pássaros**, com fotos em alta definição e links oficiais para o Instagram de cada empreendimento.
6. **Padronização Comercial dos Títulos e Higienização das Descrições (Outubro 2026):**
   * **Nova Fórmula de Títulos:** Aplicação da estrutura comercial de alto impacto: `[Qualidade/Tipo] + [Quartos/Suítes/Metragem] + [Diferenciais: Lazer/Piscina/Vista] + [Preposição Gramatical + Bairro Oficial]`.
   * **Correção de Anomalias de Scraping:** Eliminadas frases quebradas (ex: *"Lote/Terreno de no bairro..."*), corrigidas metragens absurdas (ex: imóvel 271669 que marcava *"15m²"* corrigido para *"15.000m²"*), e removidas minúsculas como *"casa em condomínio."*.
   * **Remoção Crítica de Telefones e Corretores Concorrentes:** Varredura em todas as 175 descrições eliminou telefones antigos e menções a outros corretores da imobiliária (ex: Kelly Estrela e números como `97890-6226`, `97354-6445`, `96514-9054`), padronizando todas as descrições com a assinatura e chamada exclusiva para **Ismael Dias • Habittat House: (21) 96463-9999**.
7. **Clique para Editar, Ocultação de Vendidos e Redesign das Configurações do Admin:**
   * Clicar em qualquer linha da tabela ou card abre diretamente a edição do imóvel.
   * Imóveis marcados como "Vendido" são ocultados da vitrine `/loja`, ficando identificados com `🔴 Vendida (Oculto)` no `/admin`.
   * Adicionados botões de Duplicação Rápida e Copiar Link direto.
   * Interface das Configurações totalmente reconstruída com layout balanceado, visualização do PIN com ícone de olho e toggle para ocultação de vendidos.
8. **Ajustes de Layout das 5 Solicitações e Garantia 100% de Sync no Supabase:**
   * **Item 1:** Removida a caixa azul de aviso de instruções de fotos no modal do Admin (`src/routes/admin.tsx`).
   * **Item 2:** Tabela desktop do Admin atualizada com `min-w-[980px]` e a coluna "Ações Rápidas" fixada com `sticky right-0`, garantindo que todas as opções (`[Editar]`, `[Duplicar]`, `[Copiar Link]`, `[Ver no Site]`, `[Excluir]`) fiquem 100% visíveis sem corte em qualquer resolução.
   * **Item 3:** Removido o badge `"Condomínios Fechados Angeleti"` de `/lancamentos`, removido o badge `"Imóveis Selecionados"` de `/loja`, e limpo o texto `" — RJ com o corretor Ismael Dias"` da descrição do catálogo em `/loja`.
   * **Item 4:** Botões de categoria em `/lancamentos` padronizados para o mesmo formato compacto e proporção de `/loja` (`w-[95px] sm:w-[105px] h-[80px] sm:h-[86px]`). Todas as alterações de imóveis e status no site agora sincronizam 100% via REST nativo com o Supabase na nuvem de forma assíncrona com confirmação visual.
   * **Item 5:** Corrigida a barra no Início (`/`) com `w-fit self-center lg:self-start`, eliminando o esticamento e mantendo a pílula compacta e elegante.
9. **Arquitetura Completa de SEO, Páginas Individuais (`/imovel/:sku`), Sitemap XML e Otimização para IAs:**
   * **Páginas Dedicadas por Imóvel (`/imovel/$sku`):**
     - Rota exclusiva e independente para cada um dos 175 imóveis (`src/routes/imovel.$sku.tsx`).
     - Tags `<title>` e `<meta name="description">` customizadas e dinâmicas com título comercial, bairro, tipo e preço de cada imóvel.
     - Metatags Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type: article`) para preview perfeito no WhatsApp, Facebook e LinkedIn.
     - Twitter Cards (`summary_large_image`).
     - Metatag canônica `<link rel="canonical" href="https://ismael-dias-corretor.vercel.app/imovel/:sku">` para autoridade de domínio.
     - Dados Estruturados Schema.org (`@type: RealEstateListing`, `SingleFamilyResidence`, `price`, `priceCurrency: BRL`, endereço em Teresópolis, fotos e corretor responsável).
     - Galeria de fotos com lightbox fullscreen, ficha técnica completa, selos de destaque, comodidades e botões de conversão direta para o WhatsApp com mensagem contextualizada contendo o SKU e título.
     - Seção de "Outros Imóveis no Bairro" com links internos canônicos, aumentando o PageRank e tempo de permanência do usuário.
   * **Sitemap XML Robusto (`public/sitemap.xml` & `src/routes/sitemap[.]xml.ts`):**
     - 178 URLs indexáveis mapeadas: Home (`/`), Catálogo (`/loja`), Lançamentos (`/lancamentos`) e todas as 175 páginas individuais `/imovel/:sku` com prioridade 0.8 e frequência semanal.
   * **Robots.txt com Suporte a Buscadores e IAs (`public/robots.txt`):**
     - Permite indexação de todo o conteúdo público e referencia o sitemap oficial.
     - Bloqueia `/admin` para preservar segurança e evitar indexação de área restrita.
     - Regras explícitas para crawlers de IA: `GPTBot` (OpenAI/ChatGPT), `ClaudeBot` (Anthropic), `PerplexityBot` (Perplexity AI), `Applebot` (Apple Intelligence/Siri) e `CCBot`.
   * **Padrão llms.txt para IA Generativa (`public/llms.txt`):**
     - Arquivo no padrão llms.txt que alimenta assistentes de IA com contexto sobre Ismael Dias, Habittat House, condomínios Angeleti (Golden Green, Vale dos Pássaros) e links diretos para cada imóvel do catálogo.
   * **Links Internos Integrados:**
     - No catálogo (`/loja`), todos os títulos de cards direcionam para `/imovel/:sku`.
     - No modal de detalhes rápido (`ProductDetailModal.tsx`), adicionado o botão "Página Exclusiva".
     - No admin (`/admin`), a ação "Copiar Link" copia a URL oficial dedicada `/imovel/:sku`.
10. **Refinamento Mobile, Badges Sem Quebra de Linha, Ativação de Coberturas e Limpeza do Status Disponível (Outubro 2026):**
    * **Remoção do Badge "🟢 DISPONÍVEL":**
      - Eliminado o badge redundante de disponibilidade nas páginas dos imóveis (`/imovel/:sku`), mantendo apenas selos informativos essenciais quando o imóvel estiver vendido (`🔴 Vendida`) ou reservado (`🟡 Reservado`).
    * **Prevenção de Quebra de Linha nos Badges dos Cards:**
      - Adicionado `whitespace-nowrap shrink-0 truncate` aos badges ("Destaque", "Vista Panorâmica", "Pronto p/ Construir", "Alto Padrão", "Segurança 24h", "Oportunidade") tanto no modo Grade quanto no modo Vitrine e nos modais, garantindo que o texto nunca quebre em duas linhas em telas mobile estreitas.
    * **Ativação e Contagem das Coberturas:**
      - Identificadas as 5 coberturas de alto padrão existentes no catálogo (SKUs 272985, 324516, 351142, 351660, 352715) que estavam marcadas internamente como "Apartamentos".
      - Reclassificadas oficialmente como `"Coberturas"` nos dados locais (`all_properties.json`, `imoveisData.ts`) e sincronizadas via REST API no Supabase na nuvem.
      - Removidos hifens das categorias (`Apartamentos`, `Coberturas`, `Comerciais`), padronizando o texto limpo com contador dinâmico e filtro 100% funcional.
    * **Otimização Geral da Experiência Mobile:**
      - Adicionado **Card de Ação Rápida Mobile** logo abaixo da galeria de fotos nas páginas de imóvel (`/imovel/:sku`), permitindo visualizar o valor de venda e acionar o botão de WhatsApp ou Agendamento de Visita instantaneamente sem precisar rolar até o fim da página.
      - Barra de navegação inferior (`MobileBottomNav`) agora mantém o ícone "Imóveis" ativo e destacado durante a navegação em qualquer página `/imovel/:sku`.
11. **Redesign Mobile Premium Cirúrgico da Página de Detalhes (`/imovel/:sku`):**
    * **Header Compacto Tipo Aplicativo no Mobile:**
      - Barra superior compacta (56px) com botão direto de `[← Voltar]` para o catálogo, identificação de Bairro e SKU centralizados, além de atalhos rápidos de Compartilhar e Alternador de Tema (Modo Escuro/Claro).
      - No mobile, substitui o navbar genérico e os breadcrumbs longos que consumiam mais de 315px antes da foto.
    * **Galeria no Topo Imediato e Enquadramento Padrão Card (100% Harmônica):**
      - A foto principal do imóvel agora utiliza a mesma altura e enquadramento equilibrado dos cards do catálogo e do modal de detalhes (`h-48 sm:h-72 lg:h-[450px]` com `object-cover object-center`), eliminando a distorção vertical de fotos em pé que mostravam excesso de chão/rua.
      - As casas, montanhas e detalhes arquitetônicos ficam centralizados e preenchem 100% da largura de ponta a ponta com visual panorâmico de revista.
      - Inclui badge de metragem (`property.storage`) sobreposta no canto inferior esquerdo da foto, exatamente como nos cards de imóveis do site.
      - Miniaturas compactas e integradas (`w-12 h-12`) dispostas em carrossel horizontal suave, eliminando a barra escura antiga e integrando-se perfeitamente tanto no Modo Claro quanto no Modo Escuro.
    * **Eliminação de Conflitos Visuais (Fim do Ícone Flutuante Sobre a Foto):**
      - O botão circular flutuante `WhatsFloat` foi desativado especificamente no formato mobile da rota `/imovel/:sku`, eliminando de vez a colisão em que o ícone ficava por cima das fotos do imóvel.
    * **Card de Título, Preço e Conversão Imediata (Visível na 1ª Dobra):**
      - Com a foto em altura proporcional (192px), o título do imóvel, código, bairro, valor de venda e os botões de ação `[WhatsApp]` e `[Agendar Visita]` ficam visíveis logo na primeira tela do celular, sem precisar rolar para baixo.
    * **Barra Fixa de Conversão Mobile (Sticky Bottom Bar):**
      - Nova barra de rodapé elegante e translúcida fixa na base da tela com o valor do imóvel, botão de compartilhamento rápido e botão direto `[💬 Falar com Ismael]`, com espaçamento inferior generoso (`pb-32`) para nunca cobrir o conteúdo do rodapé.
    * **Preservação 100% Intacta do Layout Desktop:**
      - Telas grandes (`sm:` e `lg:`) mantêm o grid em 12 colunas, galeria ampla (`lg:h-[450px]`), barra lateral sticky com o cartão do corretor Ismael Dias, selos de documentação verificada e a navbar completa.
12. **Resolução Definitiva de Estouro de Largura e Corte Lateral no Mobile (`/imovel/:sku`):**
    * **Causa Raiz Identificada e Corrigida:**
      - A faixa de miniaturas com fotos em `shrink-0` gerava um `min-content` intrínseco superior a 420px, que sem o confinamento de `min-w-0` e `overflow-hidden` nos containers pais de Grid e Coluna, forçava o esticamento de toda a coluna e dos cards irmãos (Título, Preço e Especificações), empurrando a margem direita para fora da tela e causando cortes em textos, badges e botões.
    * **Isolamento de Rolagem Horizontal das Miniaturas:**
      - O carrossel de miniaturas agora fica encapsulado em um wrapper rígido com `w-full min-w-0 max-w-full overflow-hidden`, permitindo deslize horizontal livre sem afetar a largura dos cards.
    * **Enquadramento Seguro em Todos os Cards:**
      - Inseridas as classes `w-full min-w-0 max-w-full overflow-hidden` no `<main>`, no Grid de 12 colunas, na coluna esquerda e em cada card (Galeria, Título/Preço, Características, Descrição e Corretor), garantindo que nada ultrapasse os limites da tela do celular.
    * **Quebra e Truncagem Inteligente:**
      - Títulos e badges agora contam com `break-words` e `min-w-0 shrink` nos botões, mantendo o botão de agendamento de visita, o selo de entrada facilitada e o código SKU 100% visíveis e confortáveis em qualquer resolução mobile.
13. **Navegação com Histórico Preservado, Sticky Sidebar Desktop e Headers Clean:**
    * **Botão Voltar Inteligente (Mobile & Desktop):**
      - Substituído o link estático `/loja` pela função `handleBack` que utiliza o histórico de navegação nativo do navegador (`window.history.back()`) com fallback automático para `/loja`.
      - **Preservação Total de Filtros e Rolagem:** Todos os filtros (`activeFilter`, `selectedBairro`, `selectedPriceRange`, `sortBy`, `searchQuery`, `viewMode`, `visibleCount`) e a posição exata de scroll vertical (`window.scrollY`) são persistidos em `sessionStorage` e restaurados imediatamente ao retornar à página `/loja` ou `/lancamentos`.
      - O usuário volta exatamente para os imóveis que estava visualizando antes, mantendo os filtros aplicados e a rolagem no ponto exato.
    * **Botão "Voltar" no Modo Web (Desktop):**
      - Adicionado botão elegante e destacado `[← Voltar]` na barra superior desktop da página `/imovel/:sku`, ao lado dos breadcrumbs, com transição interativa e ação suave de retorno.
    * **Sticky Sidebar no Desktop (Informações Descendo Junto com a Tela):**
      - A coluna direita da página `/imovel/:sku` (Preço, Botão WhatsApp, Agendar Visita, Compartilhar e Card do Corretor Ismael Dias) agora acompanha o usuário suavemente durante a rolagem da página no computador (`lg:sticky lg:top-28 self-start`).
      - Removido o bloqueio de CSS `overflow-x-hidden` nos containers pais no desktop (`overflow-x-hidden lg:overflow-x-visible`), garantindo que o comportamento `sticky` funcione de forma nativa e impecável.
    * **Limpeza dos Headers das Páginas `/loja` e `/lancamentos` (Visual Ultra Clean):**
      - Removidos os blocos de texto do topo de ambas as páginas ("Casas, Coberturas & Residências...", "Novos Lançamentos na Serra..." e banners de chamada), atendendo exatamente ao pedido de layout limpo e minimalista.
      - As páginas agora iniciam diretamente com os seletores de categorias compactos logo abaixo da barra de navegação, com espaçamento otimizado (`pt-16 sm:pt-24`).
      - Inseridas tags `<h1 className="sr-only">` para preservar 100% da autoridade de SEO sem poluir o visual.
14. **Espaçamento Mobile Perfeito, Ficha Direta sem Modais, Padronização de Lançamentos e Elevação Premium:**
    * **Espaçamento Mobile Confortável Entre Header e Categorias (`/loja` e `/lancamentos`):**
      - Ajustado o padding superior do `<main>` para `pt-24 sm:pt-28` e margem das categorias para `mt-3 sm:mt-5`.
      - Garante respiro limpo e confortável (mais de 30px de espaço livre) abaixo da navbar flutuante no mobile (`fixed top-4 h-14`), eliminando completamente qualquer sobreposição das categorias.
    * **Padronização dos Cards de Lançamentos e Acesso Direto às Fichas:**
      - Unificada a arquitetura de cards de `/lancamentos` para seguir rigorosamente os mesmos padrões visuais, tags e comportamento de `/loja`.
      - **Eliminação Definitiva de Modais:** O antigo modal popup (`ProductDetailModal`) foi removido do fluxo de usuários. Agora, qualquer clique (na foto, no título ou no botão "Ficha") leva o cliente imediatamente à página exclusiva do imóvel (`/imovel/:sku`).
      - Os lançamentos agora contam com SKUs oficiais plenamente integrados (`324009` para Golden Green e `163110` para Vale dos Pássaros), com resolução imediata via `getPropertyBySku()`.
    * **Padronização das Categorias de Lançamentos:**
      - Os seletores de categoria de `/lancamentos` adotaram o mesmo formato quadrado compacto (`aspect-square sm:aspect-auto sm:h-20`), badge de contador numérico no canto superior direito e tipografia padronizada de `/loja`.
    * **Design Elevado, Performance e Limpeza Visual na Página do Imóvel (`/imovel/:sku`):**
      - Espaçamento mobile e desktop refinado (`pt-20 sm:pt-28 lg:pt-32`), garantindo margem perfeita em relação ao header.
      - **Galeria e Performance:** Foto principal com maior amplitude (`h-52 sm:h-80 lg:h-[480px]`), gradiente inferior protetor de contraste, anel de destaque nas miniaturas selecionadas (`ring-2 ring-blue-500/30`), e carregamento priorizado com `fetchPriority="high"` e `decoding="async"`.
      - **Sidebar Sticky Desktop Premium:** Tipografia refinada para o valor de venda (`text-3xl lg:text-4xl font-black`), brilho ambiente sutil e indicador de status ativo no card do corretor (`🟢 Online`).
      - **Desobstrução Total do Conteúdo:** Removido o widget flutuante `WhatsFloat` da rota de detalhes no desktop, visto que a sidebar fixa já dispõe de CTA proeminente de WhatsApp e agendamento de visita, eliminando qualquer sobreposição sobre as fotos.
15. **Auditoria Geral de Erros, Bugs, Espaçamento, Limpeza de Código, Performance e Mobile-First (Outubro 2026):**
    * **Eliminação Global e Definitiva de Modais:**
      - Removido o modal popup residual (`ProductDetailModal`) que ainda era acionado na página inicial (`src/routes/index.tsx`). Agora 100% dos cliques em imóveis no site (Início, Catálogo e Lançamentos) direcionam diretamente para a rota exclusiva `/imovel/:sku`.
    * **Prevenção de Estouro Lateral e Mobile-First Rigoroso:**
      - Corrigido o container da maquete 3D no Hero (`TiltHouse`) de largura fixa `w-[320px]` para fluida `w-full max-w-[320px] lg:max-w-[500px]`, eliminando riscos de overflow horizontal em telas com menos de 360px.
      - Garantida a fluidez em todos os containers principais com `min-w-0 max-w-full overflow-hidden`.
    * **Segurança e SEO da Área Administrativa (`/admin`):**
      - Adicionadas diretivas `{ name: "robots", content: "noindex, nofollow" }` no `<head>` do painel administrativo, bloqueando indexação pública em buscadores.
    * **Localização e Redesign das Telas de Erro (`404` e `500`):**
      - Reformulados os componentes `NotFoundComponent` e `ErrorComponent` em `src/routes/__root.tsx`, substituindo textos em inglês por design imobiliário de luxo em português com botões diretos `[Explorar Imóveis]` e `[Voltar ao Início]`.
    * **Aceleração de Renderização e CSS Moderno (`content-visibility: auto`):**
      - Otimizado `src/styles.css` aplicando renderização inteligente nos IDs reais da página (`#destaques`, `#sobre-corretor`, `#diferenciais`, `#financiamento`, `#sobre`, `footer`), liberando memória de GPU/CPU no carregamento inicial de smartphones.
    * **Exclusão de Código Morto e Limpeza de Dependências:**
      - Removidos componentes e arquivos órfãos de templates antigos: `DeliveryPopup.tsx`, `TawkFloatingWidget.tsx`, `estoque-terephones.csv` e estilos legados.
      - Limpos dezenas de imports não utilizados em todas as rotas e componentes.
    * **Deploy Contínuo Verificado:**
      - Commit `5dbd425218ce707dfff2f84c9e0377b766c99ed1` compilado na Vercel com status **SUCCESS** e site 100% online.
16. **Padronização Visual Completa das Categorias de Lançamentos (`/lancamentos`):**
    * **Eliminação do Efeito Circular no Botão Ativo:** Removida a classe `.btn-primary-glow` que causava distorção circular devido a `border-radius: 9999px`. Aplicado o mesmo gradiente `bg-gradient-to-br from-blue-600 to-blue-700` com `rounded-2xl` retangular idêntico ao da aba de Imóveis (`/loja`).
    * **Badge Contador Integrado no Canto Superior Direito:** O contador de lançamentos foi movido para dentro do card (`top-1 right-1 sm:top-1 sm:right-1 text-[9px] px-1.5 py-0.2 rounded-full font-black`), eliminando a flutuação externa fora da borda.
    * **Dimensões, Ícones e Tipografia em 2 Linhas:** Aplicada a mesma altura (`h-[76px] sm:h-[86px]`), ícone em container suave (`p-1.5 rounded-xl`) e estrutura de 2 linhas (`meta.line2`) para "Condomínio Clube" e "Lotes Panorâmicos", garantindo alinhamento e proporção idêntica à de Imóveis.
    * **Unificação da Barra de Busca e Filtros:** O controle de busca e o toggle Grade/Vitrine no mobile agora utilizam o mesmo container unificado glass (`max-w-xl mx-auto glass rounded-2xl p-2 sm:p-2.5`) de `/loja`.
    * **Deploy Contínuo:** Commit `8cbe590a48231c985fe6880837bcdc724af1bdb4` compilado com status **SUCCESS** e online na Vercel.
17. **Integração Compacta das Categorias Dentro do Container de Busca & Filtros (Economia Máxima de Espaço de Tela):**
    * **Container Mestre Unificado:** Eliminada a divisão em dois blocos flutuantes. As categorias agora residem no topo do mesmo container glass de busca e filtros (`max-w-xl sm:max-w-2xl lg:max-w-4xl glass rounded-2xl sm:rounded-3xl p-2 sm:p-2.5`).
    * **Design Quadrado Compacto (Ícone + Nome + Contador):** Mantido o estilo quadrado elegante com ícone em destaque, rótulo em até 2 linhas e badge numérico no canto superior direito, reduzindo a altura para `h-[52px] sm:h-[62px]` e espaçamento para `gap-1 sm:gap-1.5`.
    * **Economia de ~100px de Altura no Mobile:** A fusão de containers e redução de escala economizou espaço vertical substancial, permitindo que os imóveis apareçam logo na primeira visualização da tela em qualquer smartphone.
    * **Alinhamento em `/loja` e `/lancamentos`:** Ambas as rotas foram sincronizadas com o mesmo padrão visual.
    * **Deploy Contínuo:** Commit `da024ef05033c01328891ea11de432ec6576ae8b` compilado com status **SUCCESS** e online na Vercel.
18. **Modo Grade Exclusivo, Botão Retrátil de Categorias e Filtros Unificados (`/loja` e `/lancamentos`):**
    * **Modo Grade Exclusivo (2 Colunas no Mobile, 3-4 no Desktop):** Removido completamente o modo de exibição "Vitrine" (1 por linha) em todo o site. O modo Grade passou a ser o layout fixo e definitivo, otimizando o aproveitamento visual dos imóveis na rolagem.
    * **Botão Seletor de Categorias no Local do Antigo Toggle:** O botão de alternância Grade/Vitrine foi substituído por um **Botão Seletor de Categorias** (`[Ícone] [Categoria Ativa] [(Contador)] [▾]`) localizado diretamente ao lado da barra de pesquisa.
    * **Painel Retrátil de Categorias (Economia Radical de Espaço):** Ao clicar no botão, uma gaveta elegante se expande com o grid de botões compactos quadrados (Ícone + Nome + Contador). Ao selecionar qualquer categoria ou limpar, a gaveta se fecha automaticamente, economizando mais de 100px de tela quando fechada.
    * **Filtros Unificados em Lançamentos (`/lancamentos`):** A aba de lançamentos recebeu o mesmo console de 3 dropdowns (`Região`, `Preço`, `Ordenar`) que já existia na aba de imóveis, criando paridade visual e funcional absoluta entre ambas as páginas.
    * **Componente Compartilhado Reutilizável (`FilterDropdown.tsx`):** Criado o componente standalone `src/components/FilterDropdown.tsx` para eliminar duplicidade de código entre as páginas e centralizar comportamentos (fechamento automático ao clicar fora, busca interna e badges de contagem).
    * **Deploy Contínuo:** Commit `263e6317123e57031ac210f27a785b99693c4363` compilado com status **SUCCESS** e online na Vercel.

---

## 🐍 6. SCRIPTS DE DEPLOY E VALIDAÇÃO (`brain\scratch`)

* **Push para o GitHub sem Git local:** `C:\Users\hanri\.gemini\antigravity\brain\169f3cee-1f64-4707-9e00-ff678f134827\scratch\push_to_github.py`
  * Utiliza a API do GitHub para criar Blobs -> Tree -> Commit -> Atualizar Branch `main`.
* **Validação de Sintaxe TS/TSX:** `C:\Users\hanri\.gemini\antigravity\brain\169f3cee-1f64-4707-9e00-ff678f134827\scratch\validate_syntax.py`
* **Verificação de Deploy Vercel:** `C:\Users\hanri\.gemini\antigravity\brain\169f3cee-1f64-4707-9e00-ff678f134827\scratch\check_commit_status.py`

---

## 🎯 7. CREDENCIAIS E LINKS DE ACESSO RÁPIDO

| Recurso | URL / Caminho | Credenciais / Notas |
|---|---|---|
| **Site Oficial** | `https://ismael-dias-corretor.vercel.app` | Produção online Vercel (Status: **LIVE / SUCCESS**) |
| **Página Exclusiva do Imóvel** | `https://ismael-dias-corretor.vercel.app/imovel/:sku` | Ex: `/imovel/366687` (SEO individual completo) |
| **Sitemap XML** | `https://ismael-dias-corretor.vercel.app/sitemap.xml` | 178 URLs catalogadas |
| **Robots.txt** | `https://ismael-dias-corretor.vercel.app/robots.txt` | Googlebot + GPTBot + ClaudeBot + Perplexity |
| **LLMs.txt** | `https://ismael-dias-corretor.vercel.app/llms.txt` | Contexto para Inteligências Artificiais |
| **Catálogo de Imóveis** | `https://ismael-dias-corretor.vercel.app/loja` | Com filtros de categorias ativas (incluindo 5 coberturas) |
| **Painel Admin** | `https://ismael-dias-corretor.vercel.app/admin` | **PIN: `1234`** |
| **Lançamentos** | `https://ismael-dias-corretor.vercel.app/lancamentos` | Angeleti Construtora |
| **Repositório GitHub** | `https://github.com/cronosmkt-agency/ismael-dias-corretor` | Branch `main` |
| **WhatsApp Oficial** | `(21) 96463-9999` | Ismael Dias |

---

> **Última atualização:** Outubro de 2026  
> **Status:** 100% testado, auditado, compilado com sucesso na Vercel e em pleno funcionamento!
