# Pré-visualização por link secreto + imagens na oferta

## 1. Página de pré-visualização (link secreto)

Hoje a pré-visualização abre dentro do painel e mostra só a oferta. Vamos criar uma página separada, fora do painel, com endereço secreto:

- Endereço: `/previa/<código-secreto>`
- Mostra a experiência completa: cabeçalho da aula, o vídeo da aula e, logo abaixo, a oferta inteira já liberada (sem esperar o tempo do vídeo).
- Não aparece no Google (marcada como não indexável) e não exige login: você pode mandar o link para outra pessoa avaliar.
- No painel (Oferta e Configurações) aparece o link pronto, com botão "copiar link" e botão "gerar novo código" — ao gerar um novo, o link antigo para de funcionar.
- O código fica guardado no banco e é conferido no servidor; quem errar o código vê uma página de "link inválido".

A página `/aula` real continua exatamente como está (oferta só aparece no momento configurado).

## 2. Imagens configuráveis na oferta

Nova aba/blocos de imagem no painel de Oferta, todos com o mesmo campo de envio de imagem que você já usa (arrasta/escolhe arquivo, pré-visualiza, remove):

| Onde aparece na página | O que você configura |
| --- | --- |
| "O coração da formação — O Olhar Clínico Integrativo" | Imagem de fundo do bloco |
| "Esta formação foi criada para quem..." | Imagem ilustrativa ao lado do texto (desktop) |
| "As 4 fases da formação" | Imagem de fundo suave do bloco |
| Presentes em destaque (Manual, Árvore Genealógica, Constelação, Voucher) | Imagem de capa de cada presente |
| Professor Marcos Dias (bloco final) | Foto do professor (hoje o campo existe, mas só aceita texto e não mostra imagem enviada) |

Cada imagem de fundo entra com opacidade suave, máscara e overlay, no mesmo tratamento usado na página inicial: nunca compete com o texto, nunca distorce (recorte proporcional) e some/simplifica no celular.

## 3. Correções de conteúdo

- **Foto do professor não aparecia**: a oferta não sabia ler imagens enviadas pelo painel (só links externos). Vamos passar todas as imagens da oferta pelo mesmo resolvedor usado na página inicial.
- **"Bônus de maior destaque"**: esse texto é editável no painel, no bloco de presentes, no campo "Título da lista de destaques" — vamos renomear o rótulo do campo para ficar óbvio e trocar o texto padrão para "Presentes em destaque".
- **Presentes simples** (os 6 primeiros) continuam só em texto, conforme sua escolha; a imagem aparece nos que estiverem marcados como destaque.
- Cada bloco do painel de Oferta continua em accordion, com o botão "salvar alterações" fixo no topo.

## Detalhes técnicos

- Banco: uma linha em `site_settings` (`offer_preview_token`, privada) guarda o código; validação por server function pública usando o cliente administrativo, sem expor o token ao navegador.
- Rotas: `src/routes/previa.$token.tsx` (pública, `noindex`), reutilizando `WebinarPlayer` + `OfferSection` com `offerUnlocked` forçado. A rota atual `/_authenticated/admin/preview` passa a redirecionar/apontar para o link secreto.
- Conteúdo: novos campos em `offer_content.bonuses` (jsonb) — `background_url` em `mechanism`/`phases`, `media_url` em `audience` e em cada item de `featured`, `media_url` já existente em `teacher`. Nenhuma alteração de esquema é necessária.
- `OfferSection` passa a usar `useMediaUrl` para todas as imagens; `admin.oferta.tsx` ganha `ImageField` nos pontos acima (inclusive dentro do `GenericBlock` para chaves terminadas em `_url`).
- Engine temporal, player, checkout e a página `/` não são alterados.
