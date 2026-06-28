-- ============================================================
-- KYMIZ Core Schema — Social Media Management Platform
-- ============================================================

-- Workspaces (each user can have multiple brands/clients)
CREATE TABLE workspaces (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Connected social media accounts
CREATE TABLE social_accounts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('instagram','facebook','twitter','linkedin','tiktok')),
  account_name TEXT NOT NULL,
  account_id   TEXT,
  access_token TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Scheduled / published posts
CREATE TABLE posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  platforms    TEXT[] NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','failed')) NOT NULL,
  image_url    TEXT,
  ai_generated BOOLEAN DEFAULT false NOT NULL,
  ai_prompt    TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Per-post analytics
CREATE TABLE analytics (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  platform    TEXT NOT NULL,
  impressions INTEGER DEFAULT 0 NOT NULL,
  clicks      INTEGER DEFAULT 0 NOT NULL,
  likes       INTEGER DEFAULT 0 NOT NULL,
  shares      INTEGER DEFAULT 0 NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE workspaces    ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_workspaces"
  ON workspaces FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "workspace_posts"
  ON posts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "workspace_social"
  ON social_accounts FOR ALL
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );

CREATE POLICY "post_analytics"
  ON analytics FOR ALL
  USING (
    post_id IN (SELECT id FROM posts WHERE user_id = auth.uid())
  );

-- ============================================================
-- updated_at trigger for posts
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at_posts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at_posts();

-- ============================================================
-- Indexes for common queries
-- ============================================================

CREATE INDEX idx_workspaces_user_id       ON workspaces(user_id);
CREATE INDEX idx_posts_workspace_id       ON posts(workspace_id);
CREATE INDEX idx_posts_user_id            ON posts(user_id);
CREATE INDEX idx_posts_status             ON posts(status);
CREATE INDEX idx_posts_scheduled_at       ON posts(scheduled_at);
CREATE INDEX idx_social_accounts_ws       ON social_accounts(workspace_id);
CREATE INDEX idx_analytics_post_id        ON analytics(post_id);
