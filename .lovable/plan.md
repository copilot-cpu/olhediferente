# Revisão dos campos editáveis + painel de captação mais fácil de usar

## O problema principal

Quando você escreve dois parágrafos num campo (como a subheadline), o texto é salvo
corretamente, mas a página mostra tudo grudado numa linha só. A quebra de linha existe
no banco e é ignorada na hora de exibir. O mesmo acontece em vários outros textos longos.

Além disso, há campos que você edita e que hoje não aparecem em lugar nenhum, e o painel
exige rolar a página inteira para salvar.

## O que será feito

### 1. Respeitar as quebras de linha em toda a página de captação
Todos os textos longos passam a exibir parágrafos e linhas em branco exatamente como
você digitou: subheadline do topo, microcopy do formulário, textos da segunda inscrição,
descrições dos itens de "Nesta aula você vai entender", itens das listas, biografia e
frase de encerramento do professor, fechamento do manifesto, respostas do FAQ e textos
da chamada final. O mesmo tratamento é aplicado na página da oferta em /aula.

### 2. Revisão campo a campo: tudo que se edita, aparece
Passagem completa comparando cada campo do painel com o que a página realmente usa:
- Imagem principal (íris) do topo: hoje o topo usa o vídeo, então esse campo não tem
  efeito. Vira campo de imagem de fallback (usada quando o vídeo não puder tocar) e
  ganha explicação no painel, em vez de ficar mudo.
- Fotografia do professor: imagens enviadas pelo painel não carregam na página pública
  (só links externos funcionam). Passa a resolver corretamente a imagem enviada.
- Qualquer outro campo que não tenha destino visível é corrigido ou marcado com aviso
  claro no painel. Nenhum campo editável fica sem efeito.

### 3. Botão "Salvar alterações" fixo no topo
Barra de ações fixa no topo do painel, com o botão de salvar, o aviso de "alterações
não salvas" e a mensagem de sucesso/erro. O botão do rodapé continua existindo.

### 4. Cada bloco vira um accordion
Hero, Formulário, A grande pergunta, O que você vai descobrir, Para quem é, Para quem
não é, Professor, Manifesto, Segunda inscrição, FAQ e Chamada final passam a ser seções
que você abre e fecha. Todas começam fechadas, com um resumo curto no cabeçalho, e o
bloco que tiver edição pendente fica destacado. Mesma estrutura é aplicada no painel da
oferta, para ficar consistente.

## Detalhes técnicos

- Novo componente de texto (`RichText`) que quebra o valor por `\n\n` em parágrafos e
  por `\n` em linhas; substitui os `<p>{...}</p>` diretos em `src/routes/index.tsx`,
  `src/components/capture/lead-form.tsx` e `src/components/offer/offer-section.tsx`.
- Salvamento continua com `.trim()` nas pontas, sem alterar o miolo do texto — o schema
  e a integração com `capture_page_content` não mudam.
- `src/components/admin/ui.tsx`: `AdminCard` ganha variante `collapsible`; nova
  `StickySaveBar` reaproveitando o estado atual de `SaveBar`.
- `src/routes/index.tsx`: resolver `media://` via helper de mídia para a foto do
  professor e para o fallback do topo.

## Fora de escopo
Banco de dados, engine temporal, player, checkout, copy e o layout já aprovado do topo
permanecem como estão.
