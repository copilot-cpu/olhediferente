/**
 * Copy padrão da página de captação.
 * Cada chave corresponde a um `block_key` da tabela `capture_page_content`.
 * Quando existir uma linha ativa no banco com o mesmo `block_key`, os campos
 * preenchidos lá sobrescrevem estes valores (ver `src/lib/capture-content.ts`).
 */

export type CaptureBlock = {
  title?: string;
  subtitle?: string;
  body?: string;
  media_url?: string;
  data?: Record<string, unknown>;
};

export const captureDefaults: Record<string, CaptureBlock> = {
  hero: {
    title:
      "Aprenda como a Iridologia pode se tornar a NOVA FONTE DE RECEITA do seu Consultório ainda em 2026",
    subtitle: "AULA ONLINE E GRATUITA COM O PROF. MARCOS DIAS",
    body: "Todos os dias, milhares de profissionais da saúde (e fora dela) estão utilizando a Iridologia para atender melhor e faturar mais, sem depender de novos pacientes todos os meses. Chegou a sua vez de fazer parte desse movimento. Dr. Marcos Dias possui 30 anos de experiência na área e nesse Workshop irá te entregar o passo a passo da profissão.",
    data: {
      highlight: "NOVA FONTE DE RECEITA",
      date_label: "[DATA DA AULA]",
      time_label: "[HORÁRIO]",
      brand: "OLHE DIFERENTE.",
    },
  },
  form: {
    title: "Preencha seus dados para reservar sua vaga:",
    subtitle: "QUERO MINHA VAGA GRATUITA",
    body: "Ao se inscrever, você será redirecionado para a aula e também receberá todos os detalhes no E-mail e WhatsApp cadastrados.",
  },
  question: {
    title:
      "Por que duas pessoas podem olhar para a mesma Íris e enxergar coisas diferentes?",
    data: {
      paragraphs: [
        "Uma delas procura um sinal no mapa.",
        "A outra observa a região, compara características, considera o contexto, formula perguntas e organiza uma linha de raciocínio.",
        "As duas podem ter acesso às mesmas informações.",
        "Mas não possuem, necessariamente, o mesmo olhar.",
        "Essa diferença não nasce de um dom.",
        "Ela pode ser desenvolvida.",
        "E é exatamente isso que o Professor Marcos vai mostrar nesta aula.",
      ],
    },
  },
  discover: {
    title: "Nesta aula, você vai entender:",
    data: {
      items: [
        {
          number: "01",
          title: "Por que informação não produz segurança automaticamente",
          body: "Você vai compreender por que tantos profissionais fazem cursos, compram livros e estudam diferentes técnicas, mas continuam sem saber como organizar um atendimento real.",
        },
        {
          number: "02",
          title: "A diferença entre decorar mapas e construir raciocínio",
          body: "Você vai descobrir por que reconhecer um sinal é apenas o começo e o que precisa acontecer para transformar observação em compreensão.",
        },
        {
          number: "03",
          title: "Como nasce o Olhar Clínico Integrativo",
          body: "O Professor Marcos vai apresentar a sequência usada para ensinar o aluno a:",
          steps: ["OBSERVAR", "INTERPRETAR", "INTEGRAR", "ATUAR"],
        },
        {
          number: "04",
          title: "Como a Iridologia pode ampliar sua forma de compreender o paciente",
          body: "Sem substituir exames. Sem competir com a medicina. Sem promessas de diagnóstico ou cura. Mas como uma ferramenta dentro de uma abordagem mais ampla, ética e integrativa.",
        },
        {
          number: "05",
          title: "Por que sua experiência de vida pode ser uma vantagem",
          body: "Você vai entender como maturidade, escuta, responsabilidade e repertório humano podem contribuir para a construção de uma nova capacidade profissional.",
        },
      ],
    },
  },
  audience: {
    title: "Esta aula foi preparada para você que:",
    data: {
      items: [
        "Já atua com terapias naturais e sente falta de mais estrutura durante os atendimentos.",
        "Trabalha na área da saúde ou do cuidado e deseja ampliar seu repertório.",
        "Já fez cursos, mas continua inseguro para aplicar o que aprendeu.",
        "Está considerando uma transição de carreira.",
        "Quer construir uma nova atividade profissional depois dos 40 ou 50 anos.",
        "Deseja aprender Iridologia com profundidade, responsabilidade e aplicação prática.",
        "Não procura apenas um certificado, mas capacidade profissional.",
      ],
    },
  },
  not_audience: {
    title: "Esta aula não foi preparada para quem busca:",
    body: "A proposta é formar raciocínio.\nNão alimentar atalhos.",
    data: {
      items: [
        "diagnósticos instantâneos;",
        "promessas de cura;",
        "um certificado sem estudo;",
        "respostas prontas para todos os casos.",
      ],
    },
  },
  teacher: {
    title: "Quem vai conduzir esta aula",
    subtitle: "Professor Marcos Dias",
    data: {
      paragraphs: [
        "Professor, pesquisador e formador de terapeutas naturais.",
        "Há quase três décadas, o Professor Marcos dedica sua trajetória ao ensino, à pesquisa e à prática das terapias naturais, com especial atuação em Iridologia.",
        "Ao longo desse período, formou alunos com diferentes níveis de conhecimento, reuniu milhares de imagens, desenvolveu disciplinas próprias e construiu uma maneira de ensinar que une:",
      ],
      pillars: [
        "profundidade técnica",
        "linguagem acessível",
        "visão integrativa",
        "prática",
        "ética",
        "responsabilidade profissional",
      ],
      closing:
        "Sua missão não é apenas ensinar alguém a localizar sinais na íris. É ajudar o aluno a compreender o que observa, organizar o raciocínio e desenvolver uma postura profissional mais segura.",
      badge_title: "QUASE 30 ANOS",
      badge_subtitle: "DE ENSINO, PESQUISA E PRÁTICA",
    },
  },
  manifesto: {
    title: "OLHE DIFERENTE.",
    body: "Quem muda a forma de olhar, muda a forma de cuidar.",
    data: {
      paragraphs: [
        "Durante muitos anos, ensinaram que um bom terapeuta era aquele que acumulava mais técnicas.",
        "Mais mapas. Mais protocolos. Mais certificados.",
        "Mas as pessoas não chegam divididas em técnicas.",
        "Elas chegam inteiras.",
        "Com corpo. Hábitos. Emoções. Comportamentos. Histórias.",
        "E é por isso que aprender a cuidar exige mais do que decorar respostas.",
        "Exige uma nova forma de olhar.",
      ],
    },
  },
  second_capture: {
    title: "Reserve gratuitamente sua vaga",
    body: "Participe da aula OLHE DIFERENTE e compreenda como desenvolver um olhar clínico mais integrado, estruturado e responsável.",
    data: { cta: "QUERO PARTICIPAR DA AULA GRATUITA" },
  },
  faq: {
    title: "Perguntas frequentes",
    data: {
      items: [
        {
          q: "Preciso ter formação na área da saúde?",
          a: "Não. A aula foi organizada para pessoas com diferentes níveis de conhecimento. Profissionais da saúde poderão ampliar seu repertório, enquanto iniciantes poderão compreender como funciona a construção dessa competência.",
        },
        {
          q: "Preciso já conhecer Iridologia?",
          a: "Não. O Professor Marcos explicará os princípios de forma clara e mostrará a diferença entre conhecer sinais e desenvolver um raciocínio clínico.",
        },
        {
          q: "A aula é realmente gratuita?",
          a: "Sim. Você precisa apenas preencher o formulário para receber o acesso.",
        },
        {
          q: "Quanto tempo terá a aula?",
          a: "Reserve aproximadamente 90 minutos para acompanhar o conteúdo com tranquilidade.",
        },
        {
          q: "A Iridologia substitui exames ou diagnóstico médico?",
          a: "Não. A aula trabalha a Iridologia dentro de uma abordagem complementar, ética e responsável. Ela não substitui avaliação médica, exames ou outros profissionais.",
        },
        {
          q: "A aula ficará gravada?",
          a: "Informação a definir.",
        },
        {
          q: "Como receberei o acesso?",
          a: "O link será enviado para o e-mail e o WhatsApp informados no cadastro.",
        },
      ],
    },
  },
  final_cta: {
    title: "Talvez não esteja faltando mais uma técnica.",
    subtitle: "Talvez esteja faltando uma nova forma de olhar.",
    body: "Reserve agora sua vaga gratuita para a aula: OLHE DIFERENTE.",
    data: {
      quote: "Quem muda a forma de olhar, muda a forma de cuidar.",
      cta: "QUERO MINHA VAGA",
    },
  },
};
