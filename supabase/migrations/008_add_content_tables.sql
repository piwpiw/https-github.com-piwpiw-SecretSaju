-- Add Content Tables for Phase 9
CREATE TABLE IF NOT EXISTS animal_archetypes (
  code TEXT PRIMARY KEY,
  animal_name TEXT NOT NULL,
  base_traits JSONB NOT NULL,
  age_context JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  food_name TEXT NOT NULL,
  reason TEXT,
  image_url TEXT,
  target_age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  reason TEXT,
  price_range TEXT,
  affiliate_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for content tables (Public read access)
ALTER TABLE animal_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to animal_archetypes" ON animal_archetypes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to food_recommendations" ON food_recommendations
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to product_recommendations" ON product_recommendations
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_recommendations_code ON food_recommendations(code);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_code ON product_recommendations(code);
