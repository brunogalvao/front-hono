-- Seed: Default system categories (workspace_id IS NULL, is_default = true)
-- These are copied per workspace when handle_new_user fires

INSERT INTO public.categories (workspace_id, name, type, is_default) VALUES
  -- Despesas
  (NULL, 'Alimentação',        'despesa', true),
  (NULL, 'Transporte',         'despesa', true),
  (NULL, 'Moradia',            'despesa', true),
  (NULL, 'Saúde',              'despesa', true),
  (NULL, 'Educação',           'despesa', true),
  (NULL, 'Lazer',              'despesa', true),
  (NULL, 'Vestuário',          'despesa', true),
  (NULL, 'Assinaturas',        'despesa', true),
  (NULL, 'Serviços',           'despesa', true),
  (NULL, 'Outros (despesa)',   'despesa', true),
  -- Receitas
  (NULL, 'Salário',            'receita', true),
  (NULL, 'Freelance',          'receita', true),
  (NULL, 'Investimentos',      'receita', true),
  (NULL, 'Outros (receita)',   'receita', true)
ON CONFLICT DO NOTHING;
