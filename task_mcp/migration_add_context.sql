-- Migration: thêm context & next_steps vào bảng tasks
-- Chạy trong Supabase Dashboard > SQL Editor

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS context    text,
  ADD COLUMN IF NOT EXISTS next_steps text;

COMMENT ON COLUMN tasks.context    IS 'Claude tự ghi: files đã sửa, quyết định kỹ thuật, approach đã dùng';
COMMENT ON COLUMN tasks.next_steps IS 'Claude tự ghi: bước tiếp theo cần làm khi resume task';
