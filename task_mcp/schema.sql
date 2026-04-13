-- Schema cho bảng tasks trong Supabase
-- Chạy SQL này trong Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS tasks (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL,
  description text,
  status      text        DEFAULT 'pending'
                          CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority    text        DEFAULT 'normal'
                          CHECK (priority IN ('low', 'normal', 'high')),
  notes       text,
  context     text,       -- Claude tự ghi: files đã sửa, approach, quyết định kỹ thuật
  next_steps  text,       -- Claude tự ghi: bước tiếp theo khi resume task
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Tự động cập nhật updated_at khi có thay đổi
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index để filter theo status nhanh hơn
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
