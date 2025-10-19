CREATE TABLE user_question_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer TEXT,
  is_correct BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, lesson_id, question_id)
);