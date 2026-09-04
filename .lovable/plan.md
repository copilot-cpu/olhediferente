# Vídeo em loop como fundo do topo da página

## O que muda

O olho/íris que hoje aparece à direita do topo sai. No lugar, o vídeo que você enviou (8 segundos, zoom no olho) passa a ocupar todo o fundo da primeira dobra da página inicial.

- Roda sozinho, em loop contínuo, sem som e sem nenhum controle de player na tela.
- Cobre toda a largura e altura do topo, cortando o excesso para não deformar a imagem.
- Sobre o vídeo entra um véu escuro em degradê (verde muito escuro da identidade), para o título, a data e o formulário continuarem perfeitamente legíveis.
- O topo passa a ter uma coluna só, com o texto e o formulário alinhados à esquerda e o formulário ganhando ainda mais destaque sobre o vídeo.

## Detalhes de comportamento

- No celular, o vídeo também roda em loop, sem entrar em tela cheia.
- Se o aparelho estiver em modo de economia de bateria ou com "reduzir movimento" ativado, mostramos apenas um quadro parado do vídeo — nada quebra.
- Enquanto o vídeo carrega, aparece uma imagem inicial (primeiro quadro) para não haver tela vazia.
- O peso do arquivo é de cerca de 4 MB; ele é carregado depois do texto, então a página continua abrindo rápido.

## Detalhes técnicos

- O vídeo é registrado como asset de CDN (`lovable-assets create`) e o áudio é removido do arquivo, além de `muted`; um pôster JPG é extraído do primeiro quadro.
- Elemento `<video autoplay muted loop playsinline preload="metadata" poster>` sem `controls`, `aria-hidden`, dentro de um wrapper `absolute inset-0 object-cover` na seção do topo em `src/routes/index.tsx`.
- Camada de overlay com gradiente usando os tokens existentes (`--background` / `surface-deep`) — nenhuma cor nova.
- `IrisVisual` deixa de ser usado no topo; o componente `IrisMark`/`IrisGlow` permanece no projeto para outros usos.
- Sem mudanças em banco, formulário, leads, `/aula`, oferta ou admin.

## Validação

- Typecheck e build.
- Screenshots em 390, 768, 1024 e 1440 px conferindo legibilidade e ausência de estouro.
