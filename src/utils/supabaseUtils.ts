import { supabase } from "@/lib/supabase";
import { showSuccess, showError } from "./toast";

export const markLessonAsCompleted = async (userId: string, courseId: string, lessonId: string) => {
  try {
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });

    if (error) {
      throw error;
    }
    console.log(`Lesson ${lessonId} marked as completed for user ${userId}`);
    return true;
  } catch (error: any) {
    console.error("Error marking lesson as completed:", error.message);
    showError(`Failed to mark lesson as complete: ${error.message}`);
    return false;
  }
};

export const updateUserStreak = async (userId: string) => {
  try {
    const { data: existingStreak, error: fetchError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw fetchError;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let newStreak = 1;
    let lastActiveDate = today.toISOString();

    if (existingStreak) {
      const lastActive = new Date(existingStreak.last_active_date);
      lastActive.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (lastActive.getTime() === today.getTime()) {
        // Already active today, no streak change
        newStreak = existingStreak.current_streak;
      } else if (lastActive.getTime() === yesterday.getTime()) {
        // Active yesterday, increment streak
        newStreak = existingStreak.current_streak + 1;
      } else {
        // Not active yesterday or today, reset streak
        newStreak = 1;
      }
    }

    const { error: upsertError } = await supabase
      .from('streaks')
      .upsert({ user_id: userId, current_streak: newStreak, last_active_date: lastActiveDate }, { onConflict: 'user_id' });

    if (upsertError) {
      throw upsertError;
    }

    showSuccess(`Streak updated to ${newStreak} days!`);
    return newStreak;
  } catch (error: any) {
    console.error("Error updating streak:", error.message);
    showError(`Failed to update streak: ${error.message}`);
    return null;
  }
};

export const fetchUserLessonProgress = async (userId: string, courseId: string) => {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error("Error fetching user lesson progress:", error.message);
    return [];
  }
  return data.map(item => item.lesson_id);
};