/**
 * Copy padrão da oferta (Formação Profissional em Iridologia Clínica).
 * Cada chave corresponde a um `block_key` da tabela `offer_content`.
 * Linhas ativas no banco sobrescrevem estes valores (ver `src/lib/offer-content.ts`).
 *
 * Mapeamento de colunas:
 * - title / subtitle / body / price_label / guarantee / checkout_url  → colunas homônimas
 * - data                                                             → coluna jsonb `bonuses`
 */

export type OfferBlock = {
  title?: string;
  subtitle?: string;
  body?: string;
  price_label?: string;
  guarantee?: string;
  checkout_url?: string;
  data?: Record<string, unknown>;
};

export const offerDefaults: Record<string, OfferBlock> = {
  transition: {
    title:
      "Agora você já entendeu que aprender Iridologia não significa decorar um mapa.",
    subtitle:
      "Significa aprender a observar, interpretar, integrar e atuar com responsabilidade.",
    body: "E foi exatamente para transformar esse conhecimento em uma capacidade profissional estruturada que nasceu a Formação Profissional em Iridologia Clínica.",
    data: { eyebrow: "O PRÓXIMO PASSO" },
  },

  presentation: {
    title: "FORMAÇÃO PROFISSIONAL EM",
    subtitle: "IRIDOLOGIA CLÍNICA",
    body: "Em 6 meses, você desenvolve a base técnica, o raciocínio clínico integrativo e a postura profissional para utilizar a Iridologia de forma ética, segura e aplicada, transformando interesse em terapias naturais em capacidade real de atendimento.",
    data: {
      marks: [
        { value: "6 MESES", label: "de jornada" },
        { value: "FORMAÇÃO PROFISSIONAL", label: "estrutura completa" },
        { value: "AULAS + ENCONTROS AO VIVO + CASOS", label: "programa híbrido" },
      ],
    },
  },

  mechanism: {
    title: "O Olhar Clínico Integrativo",
    body: "Enquanto muitas formações se concentram em mapas, sinais e informações isoladas, esta jornada ensina o aluno a organizar tudo dentro de uma linha de raciocínio aplicável.",
    data: {
      background_url: "",
      eyebrow: "O CORAÇÃO DA FORMAÇÃO",
      steps: [
        { number: "01", title: "OBSERVAR", body: "com precisão" },
        { number: "02", title: "INTERPRETAR", body: "com raciocínio" },
        { number: "03", title: "INTEGRAR", body: "com profundidade" },
        { number: "04", title: "ATUAR", body: "com responsabilidade" },
      ],
    },
  },

  problem: {
    title: "Talvez informação não seja o que está faltando.",
    body: "Hoje, muita gente:",
    data: {
      items: [
        "faz cursos;",
        "compra livros;",
        "consome conteúdo;",
        "aprende técnicas isoladas;",
        "mas continua sem segurança para organizar uma avaliação real.",
      ],
      paragraphs: [
        "O problema não é necessariamente falta de conhecimento.",
        "É falta de estrutura para transformar conhecimento em raciocínio e raciocínio em atuação.",
      ],
      highlights: [
        "Ele não quer mais curiosidade.",
        "Quer estrutura.",
        "Quer método.",
        "Quer clareza.",
        "Quer saber o que fazer com o que aprende.",
      ],
    },
  },

  audience: {
    title:
      "Esta formação foi criada para quem quer transformar interesse em capacidade profissional.",
    data: {
      media_url: "",
      items: [
        "Profissionais da saúde e do cuidado que querem ampliar repertório de atendimento.",
        "Terapeutas integrativos que já atendem, mas querem mais profundidade e estrutura.",
        "Pessoas em transição de carreira que desejam transformar interesse por terapias naturais em profissão.",
        "Público maduro, normalmente acima dos 40 anos, que quer seguir ativo, útil e construindo algo novo.",
        "Pessoas que não querem apenas certificado, mas capacidade profissional real.",
      ],
    },
  },

  structure: {
    title: "Uma jornada de 6 meses para desenvolver um novo olhar.",
    subtitle: "6 MESES",
    body: "O conteúdo principal fica organizado em uma trilha gravada, enquanto os encontros ao vivo aprofundam interpretação, aplicação prática, dúvidas e casos reais.",
    data: {
      format_intro: "Programa híbrido com:",
      format: [
        "aulas gravadas;",
        "encontros coletivos ao vivo;",
        "comunidade de suporte;",
        "análise de casos;",
        "desenvolvimento de raciocínio.",
      ],
      highlight: "2 encontros ao vivo por mês",
    },
  },

  phases: {
    title: "As 4 fases da formação",
    data: {
      background_url: "",
      items: [
        {
          label: "FASE 1",
          title: "APRENDER A OBSERVAR",
          objective: "Construir a base técnica e o olhar inicial da Iridologia Clínica.",
          learns: [
            "estruturas da íris;",
            "zonas;",
            "vetores;",
            "colarete;",
            "principais sinais;",
            "organização anatômica e técnica.",
          ],
          result:
            "Deixa de olhar a íris como uma imagem confusa e começa a reconhecer padrões fundamentais com mais segurança.",
        },
        {
          label: "FASE 2",
          title: "APRENDER A INTERPRETAR",
          objective: "Desenvolver raciocínio clínico a partir dos sinais observados.",
          learns: [
            "correlação entre sinais e funcionamento do organismo;",
            "leitura menos descritiva e mais analítica;",
            "compreensão complementar da esclera;",
            "interpretação clínica com mais critério.",
          ],
          result:
            "Deixa de depender apenas da localização e começa a compreender significado e contexto dos sinais.",
        },
        {
          label: "FASE 3",
          title: "APRENDER A INTEGRAR",
          objective:
            "Ampliar o olhar para além do orgânico e compreender o indivíduo de forma integrada.",
          learns: [
            "relação entre aspectos físicos, emocionais e comportamentais;",
            "integração com florais;",
            "leitura mais ampla do paciente;",
            "cruzamento entre sinais, comportamento e padrões pessoais.",
          ],
          result:
            "A íris deixa de ser apenas mapa e passa a ser ferramenta de compreensão mais ampla do indivíduo.",
        },
        {
          label: "FASE 4",
          title: "APRENDER A ATUAR",
          objective: "Transformar conhecimento em postura profissional segura.",
          learns: [
            "ética;",
            "limites da atuação terapêutica;",
            "boas práticas;",
            "comunicação com o paciente;",
            "postura profissional;",
            "responsabilidade.",
          ],
          result:
            "Sai da posição de estudante inseguro e desenvolve uma postura mais consciente, segura e profissional para começar a atuar.",
        },
      ],
    },
  },

  live: {
    title: "O conteúdo gravado ensina.",
    subtitle: "Os encontros transformam conhecimento em aplicação.",
    body: "Os encontros coletivos acontecem até 2 vezes por mês e têm foco em:",
    data: {
      items: [
        "análise de imagens;",
        "discussão de casos;",
        "resolução de dúvidas;",
        "aprofundamento de raciocínio;",
        "orientação de conduta profissional;",
        "correção de interpretação.",
      ],
      highlight:
        "Os encontros não repetem o gravado. Eles transformam conteúdo em entendimento aplicado.",
    },
  },

  progress: {
    title: "Você não avança apenas assistindo.",
    body: "O desenvolvimento acontece por meio de:",
    data: {
      items: [
        "observação orientada",
        "análise progressiva",
        "exercícios de interpretação",
        "discussão de casos",
        "integração de conhecimentos",
        "reflexão ética",
        "treino de raciocínio clínico",
      ],
      closing:
        'O resultado da formação não é apenas "saber mais". É pensar melhor e atuar com mais estrutura.',
    },
  },

  bonuses: {
    title: "Ao entrar na formação, você também recebe:",
    data: {
      items: [
        {
          number: "01",
          title: "GUIA DE INÍCIO DA PRÁTICA EM IRIDOLOGIA",
          body: "Para ajudar o aluno a sair do estudo e organizar os primeiros passos da atuação.",
        },
        {
          number: "02",
          title: "ROTEIRO DE ANAMNESE INTEGRATIVA",
          body: "Para conduzir avaliações com mais clareza e menos improviso.",
        },
        {
          number: "03",
          title: "CHECKLIST DE LEITURA DA ÍRIS",
          body: "Para reduzir insegurança durante a observação.",
        },
        {
          number: "04",
          title: "MAPA DE LIMITES ÉTICOS E ENCAMINHAMENTO",
          body: "Para o aluno saber o que pode fazer, o que não deve fazer e quando encaminhar.",
        },
        {
          number: "05",
          title: "BIBLIOTECA COMENTADA DE CASOS",
          body: "Seleção de casos com explicação do raciocínio para acelerar repertório.",
        },
        {
          number: "06",
          title: "PLANO DE ORGANIZAÇÃO DO ATENDIMENTO",
          body: "Para estruturar o fluxo inicial de consulta, registro e acompanhamento.",
        },
      ],
      featured_title: "Presentes em destaque",
      featured: [
        {
          number: "07",
          kind: "LIVRO",
          title: "MANUAL DEFINITIVO DA NATUROPATIA",
          paragraphs: [
            "Material prático para ampliar a capacidade de orientação dentro das terapias naturais.",
            "Organizado por sistemas, facilitando a identificação de fragilidades e a sugestão de tratamentos naturais com mais critério.",
            "Inclui aplicações em:",
          ],
          items: [
            "Fitoterapia",
            "Florais de Bach",
            "Florais frequenciais",
            "Trofoterapia",
            "Hidroterapia",
          ],
          note: "Além de abordagens para situações não sistêmicas.",
        },
        {
          number: "08",
          kind: "LIVRO",
          title: "IRIDOLOGIA E A ÁRVORE GENEALÓGICA",
          paragraphs: [
            "Material que aprofunda a relação entre emoções, herança familiar e sinais presentes na íris.",
            "Ajuda o aluno a compreender:",
          ],
          items: [
            "padrões familiares;",
            "constituição;",
            "aspectos emocionais e herdados;",
            "leitura mais ampla do indivíduo.",
          ],
        },
        {
          number: "09",
          kind: "CURSO",
          title: "CONSTELAÇÃO FAMILIAR PELA ÍRIS",
          paragraphs: [
            "Um complemento para ampliar a leitura integrativa do aluno e sua compreensão sobre padrões familiares, emocionais e comportamentais a partir da íris.",
          ],
        },
        {
          number: "10",
          kind: "VOUCHER",
          title: "VOUCHER DE R$ 500",
          value: "R$ 500",
          paragraphs: ["para outro curso da escola."],
        },
      ],
    },
  },

  differentials: {
    title: "Não é apenas mais um curso de Iridologia.",
    data: {
      items: [
        "Forma raciocínio, não apenas memória.",
        "Integra técnica, visão ampliada e ética profissional.",
        "Conversa com quem quer profissão, não passatempo.",
        "Aproveita quase três décadas de ensino, pesquisa e prática.",
        "Usa análise de casos como parte central da aprendizagem.",
        "Combina profundidade com uma rotina viável.",
      ],
    },
  },

  teacher: {
    title: "Você será guiado por quem dedica quase três décadas a esse campo.",
    subtitle: "PROF. MARCOS DIAS",
    body: "Quase 30 anos de ensino, pesquisa e prática.",
    data: {
      paragraphs: [
        "Professor, pesquisador e formador de terapeutas naturais, com atuação dedicada à Iridologia e às terapias integrativas.",
        "Sua forma de ensinar une profundidade técnica, linguagem acessível, visão integrativa e responsabilidade profissional.",
      ],
      media_url: "",
    },
  },

  offer: {
    // title = nome da formação · subtitle = promessa · price_label = preço
    // body = texto de parcelamento (vazio = não exibe) · checkout_url = destino do CTA
    title: "Formação Profissional em Iridologia Clínica",
    subtitle: "Comece agora sua Formação Profissional em Iridologia Clínica.",
    price_label: "R$ 497,00",
    body: "",
    checkout_url: "",
    data: {
      eyebrow: "CONDIÇÃO PARA PARTICIPANTES DA AULA",
      cta: "QUERO COMEÇAR MINHA FORMAÇÃO",
      duration: "6 meses de formação",
      format_summary: "Programa híbrido: aulas gravadas, encontros ao vivo e análise de casos.",
      includes: [
        "6 meses de formação",
        "Aulas gravadas",
        "2 encontros ao vivo por mês",
        "Comunidade de suporte",
        "Análise de casos",
        "10 presentes especiais",
      ],
      microcopy:
        "Acesso às aulas e orientações de entrada serão enviados após a confirmação da inscrição.",
      sticky_title: "Formação em Iridologia Clínica",
      sticky_price: "R$ 497",
      sticky_cta: "QUERO COMEÇAR",
    },
  },

  faq: {
    title: "Perguntas frequentes sobre a formação",
    data: {
      items: [
        {
          q: "Preciso ter formação na área da saúde?",
          a: "Não. A formação recebe alunos com diferentes níveis de experiência. Profissionais da saúde podem ampliar seu repertório e iniciantes podem construir a base necessária de forma progressiva.",
        },
        {
          q: "Preciso já conhecer Iridologia?",
          a: "Não. A jornada começa pelos fundamentos e progride até interpretação, integração e atuação.",
        },
        { q: "Quanto tempo dura a formação?", a: "6 meses." },
        {
          q: "Como funcionam os encontros ao vivo?",
          a: "São encontros coletivos realizados até 2 vezes por mês, voltados a análise de imagens, discussão de casos, dúvidas e aprofundamento do raciocínio.",
        },
        {
          q: "As aulas ficam gravadas?",
          a: "O conteúdo principal da formação é entregue em trilha gravada.",
        },
        {
          q: "A Iridologia substitui diagnóstico médico?",
          a: "Não. A formação apresenta a Iridologia dentro de uma abordagem complementar, ética e responsável e não substitui avaliação médica, exames ou outros profissionais habilitados.",
        },
      ],
    },
  },

  closing: {
    title: "Talvez o próximo passo não seja aprender mais uma técnica.",
    subtitle: "Talvez seja aprender a olhar de outra forma.",
    body: "Se você quer transformar interesse em terapias naturais em uma capacidade profissional mais estruturada, a Formação Profissional em Iridologia Clínica foi criada para conduzir essa jornada.",
    data: {
      brand: "OLHE DIFERENTE.",
      brand_line: "Quem muda a forma de olhar, muda a forma de cuidar.",
    },
  },
};

export const OFFER_BLOCK_KEYS = Object.keys(offerDefaults);
