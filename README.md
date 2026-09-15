# Olhe Diferente

Você irá construir um sistema de webinar evergreen chamado OLHE DIFERENTE para o Professor Marcos Dias.

IMPORTANTE:

Não tente implementar todo o produto nesta etapa.

Esta primeira etapa deve criar SOMENTE a fundação técnica e visual.

STACK:

- React/stack padrão estável do Lovable

- Supabase para banco, autenticação e persistência

- arquitetura componentizada

- responsividade mobile-first

ROTAS:

/

Página de captação.

/aula

Página de transmissão.

/admin

Painel administrativo protegido.

DIREÇÃO VISUAL:

A identidade deve transmitir natureza, conhecimento, profundidade, tradição e autoridade.

Utilize:

- verde floresta/oliva muito escuro como base;

- dourado/ocre como destaque;

- creme/off-white;

- títulos serifados editoriais;

- textos/interface em sans-serif limpa;

- elementos visuais inspirados em íris humana.

A página NÃO deve parecer:

- SaaS;

- startup;

- dashboard tecnológico;

- landing page neon;

- template genérico de infoproduto.

Crie um design system reutilizável com:

- tokens de cores;

- typography scale;

- spacing;

- buttons;

- inputs;

- cards;

- containers;

- badges;

- accordions;

- feedback states.

BANCO:

Crie estrutura inicial para:

leads

site_settings

capture_page_content

webinar_settings

webinar_events

offer_content

Crie autenticação administrativa.

Configure políticas de segurança/RLS adequadas.

Usuários públicos poderão enviar formulário de lead, mas NUNCA poderão listar leads ou alterar configurações.

Crie as três rotas, mas NÃO implemente ainda toda a copy ou lógica avançada do webinar.

Crie apenas:

1. arquitetura;

2. banco;

3. autenticação;

4. design system;

5. shells das três rotas;

6. navegação administrativa inicial.

O /admin deve possuir sidebar com:

Dashboard

Captação

Webinar

Oferta

Simulação

Leads

Configurações

IMPORTANTE:

Não invente conteúdo.

Não implemente eventos simulados ainda.

Não implemente delayed reveal ainda.

Não tente integrar serviços externos ainda.

Ao terminar, apresente:

- estrutura criada;

- tabelas;

- rotas;

- componentes;

- políticas de acesso;

- qualquer decisão técnica tomada.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://olhediferente.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fa7ada14-5637-49e1-bb92-29211cf8dab7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
