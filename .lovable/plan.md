# Plano: refinamento visual do Hero da landing page

## Objetivo
Ajustar o Hero da rota `/` para equilibrar melhor o título, o olho/íris e o formulário de captação no desktop, sem reescrever outras seções ou mudar banco/formulário/leads.

## Ajustes propostos

### 1. Título do Hero menor no desktop
- Reduzir a escala da utilidade `text-hero` em `lg` para deixar a headline mais compacta.
- Manter a hierarquia e o destaque dourado.

### 2. Preencher melhor a coluna direita
- Mudar o grid do Hero de `lg:grid-cols-[55fr_45fr]` para `lg:grid-cols-[1fr_1fr]` (ou proporção mais equilibrada, ex.: `50fr/50fr` ou `52fr/48fr`).
- Isso reduz o espaço vazio entre o texto/formulário e a íris.

### 3. Íris/olho um pouco menor
- Reduzir o tamanho máximo do componente `IrisVisual` no desktop.
- Ajustar os `max-w` do fallback `IrisMark` e da imagem real para não ocupar tanto vertical/horizontalmente.

### 4. Formulário de captação mais destacado
- Ampliar levemente a área do card do formulário no Hero (`max-w-md` → `max-w-lg`).
- Reforçar o contraste do card com fundo `surface-raised` ou borda sutil dourada.
- Aumentar o peso visual do botão CTA (manter cor primária, talvez padding maior ou sombra suave).
- Garantir que o formulário não fique "espremido" — revisar padding interno e espaçamento entre campos.

## Escopo
- Alterar somente `src/routes/index.tsx`, `src/styles.css` (se necessário para ajustar `text-hero`) e, opcionalmente, `src/components/capture/lead-form.tsx` para refinamentos de espaçamento do formulário.
- Não alterar banco de dados, autenticação, lógica de leads, UTMs, engine do webinar, rota `/aula`, oferta ou admin.

## Validação
- Verificar typecheck e build.
- Capturar screenshots em 390px, 768px, 1024px e 1440px para confirmar ausência de overflow e equilíbrio visual.
