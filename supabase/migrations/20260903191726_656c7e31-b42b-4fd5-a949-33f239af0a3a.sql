INSERT INTO public.offer_content (block_key, title, subtitle, price_label, body, checkout_url, bonuses, sort_order, is_active)
VALUES (
  'offer',
  'Formação Profissional em Iridologia Clínica',
  'Comece agora sua Formação Profissional em Iridologia Clínica.',
  'R$ 497,00',
  NULL,
  NULL,
  jsonb_build_object(
    'eyebrow', 'CONDIÇÃO PARA PARTICIPANTES DA AULA',
    'cta', 'QUERO COMEÇAR MINHA FORMAÇÃO',
    'duration', '6 meses de formação',
    'format_summary', 'Programa híbrido: aulas gravadas, encontros ao vivo e análise de casos.',
    'includes', jsonb_build_array('6 meses de formação','Aulas gravadas','2 encontros ao vivo por mês','Comunidade de suporte','Análise de casos','10 presentes especiais'),
    'microcopy', 'Acesso às aulas e orientações de entrada serão enviados após a confirmação da inscrição.',
    'sticky_title', 'Formação em Iridologia Clínica',
    'sticky_price', 'R$ 497',
    'sticky_cta', 'QUERO COMEÇAR'
  ),
  13,
  true
)
ON CONFLICT (block_key) DO NOTHING;