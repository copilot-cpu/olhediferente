INSERT INTO public.webinar_settings (key, title, video_url, schedule_mode, is_active, config)
VALUES (
  'main',
  'OLHE DIFERENTE',
  'https://player-vz-234cad63-6f8.tv.pandavideo.com.br/embed/?v=3c9224ad-dbf6-46ae-ad6d-ed09ff0db18a',
  'evergreen',
  true,
  jsonb_build_object(
    'broadcast_label', 'AULA EM ANDAMENTO',
    'teacher_name', 'Marcos Dias',
    'lesson_subtitle', 'Aula online gratuita',
    'offer_reveal_seconds', 0,
    'simulation_mode', false
  )
)
ON CONFLICT (key) DO NOTHING;