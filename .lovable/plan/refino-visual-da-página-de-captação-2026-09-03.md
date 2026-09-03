# Refino visual da página de captação (/)

Três frentes, apenas na apresentação da landing: escala tipográfica no desktop, alternância de fundo entre blocos, e correção do estouro de largura no mobile. Sem mexer em banco, formulário, leads, UTMs, rotas ou lógica.

## 1. Tipografia menor no desktop

As fontes crescem demais em telas grandes. Reduzir os tetos das escalas em `src/styles.css`:

- `text-hero`: teto de 5.3rem para ~4.2rem em desktop (mobile permanece igual).
- `text-display`: teto de 4.5rem para ~3.4rem.
- `text-title`: teto de 2.75rem para ~2.25rem.
- `text-heading` e `text-lede`: leve redução do teto para acompanhar.

Mobile fica praticamente inalterado — o ajuste é só na parte alta do `clamp`.

## 2. Ritmo de fundos entre blocos

Hoje quase todas as seções usam o mesmo verde escuro, então as trocas de bloco não são percebidas. Criar dois tons de superfície como tokens no design system (variações do verde floresta já existente: uma um pouco mais clara/oliva, outra mais profunda) e alternar seção a seção:

```text
Hero................ base (escuro atual)
A grande pergunta... superfície elevada (mais clara)
Nesta aula.......... base
Para quem é......... superfície elevada
Para quem não é..... base profunda (já é escura hoje)
Professor........... superfície elevada
Manifesto........... profunda (mantém)
Segunda captura..... base
FAQ................. superfície elevada
CTA final........... profunda
```

Cada troca ganha uma borda superior sutil em dourado/borda para marcar o corte. Nada de nova paleta: só variações controladas do verde já aprovado.

## 3. Campos do formulário com fundo claro

Nos dois formulários (hero e segunda captura), os inputs de Nome, E-mail e WhatsApp passam a ter fundo creme/branco com texto escuro e foco dourado, deixando óbvio o que deve ser preenchido. Feito por variante no componente de input usado pelo formulário, sem alterar validação nem envio.

## 4. Correção do estouro no mobile

O botão "QUERO PARTICIPAR DA AULA GRATUITA" não quebra linha e empurra o card do formulário além da tela. Correções:

- permitir quebra de linha e altura automática no botão (texto longo em duas linhas);
- garantir `min-w-0` nos containers do formulário e do card;
- revisar a página inteira em 390px para eliminar qualquer rolagem horizontal remanescente.

## Detalhes técnicos

- Arquivos tocados: `src/styles.css` (escalas + tokens de superfície), `src/routes/index.tsx` (classes de fundo por seção), `src/components/ui/button.tsx` (quebra de texto), `src/components/ui/input.tsx` ou o form em `src/components/capture/lead-form.tsx` (campos claros).
- Nenhuma cor hardcoded: tudo via tokens semânticos no `@theme`/`:root`.
- QA visual em 390, 430, 768, 1280 e 1440px, verificando ausência de scroll horizontal e contraste dos campos claros.
