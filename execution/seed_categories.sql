-- =============================================
-- APP FINANCI - Categorias Padrão
-- Execute após o schema principal
-- =============================================

INSERT INTO categories (id, name, icon, type, color) VALUES
  -- Despesas
  ('alimentacao', 'Alimentação', 'restaurant', 'expense', '#FF6E40'),
  ('transporte', 'Transporte', 'directions-car', 'expense', '#448AFF'),
  ('moradia', 'Moradia', 'home', 'expense', '#E040FB'),
  ('saude', 'Saúde', 'favorite', 'expense', '#FF5252'),
  ('lazer', 'Lazer', 'sports-esports', 'expense', '#18FFFF'),
  ('educacao', 'Educação', 'school', 'expense', '#FFD740'),
  ('vestuario', 'Vestuário', 'checkroom', 'expense', '#B388FF'),
  ('tecnologia', 'Tecnologia', 'devices', 'expense', '#69F0AE'),
  ('outros', 'Outros', 'more-horiz', 'both', '#A0A0A0'),

  -- Receitas
  ('salario', 'Salário', 'attach-money', 'income', '#00E676'),
  ('freelance', 'Freelance', 'work', 'income', '#00BFA5'),
  ('investimento', 'Investimento', 'trending-up', 'income', '#448AFF'),
  ('presente', 'Presente', 'card-giftcard', 'income', '#FFD740')
ON CONFLICT (id) DO NOTHING;
