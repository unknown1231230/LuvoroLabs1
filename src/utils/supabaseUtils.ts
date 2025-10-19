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

export const fetchUserLessonProgress = async (userId: string, courseId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      throw error;
    }
    return data.map(item => item.lesson_id);
  } catch (error: any) {
    console.error("Error fetching user lesson progress:", error.message);
    showError(`Failed to fetch lesson progress: ${error.message}`);
    return [];
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

    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0); // Normalize to start of UTC day

    let newStreak = 1;
    let lastActiveDateToSave = todayUtc.toISOString(); // Save as UTC ISO string

    if (existingStreak) {
      const lastActiveUtc = new Date(existingStreak.last_active_date);
      lastActiveUtc.setUTCHours(0, 0, 0, 0); // Normalize existing date to start of UTC day

      // Check if the last active date is today (UTC)
      if (
        lastActiveUtc.getUTCFullYear() === todayUtc.getUTCFullYear() &&
        lastActiveUtc.getUTCMonth() === todayUtc.getUTCMonth() &&
        lastActiveUtc.getUTCDate() === todayUtc.getUTCDate()
      ) {
        // Already active today (UTC), no streak change
        newStreak = existingStreak.current_streak;
      } else {
        // Check if the last active date was yesterday (UTC)
        const yesterdayUtc = new Date(todayUtc);
        yesterdayUtc.setUTCDate(todayUtc.getUTCDate() - 1); // Subtract one day in UTC

        if (
          lastActiveUtc.getUTCFullYear() === yesterdayUtc.getUTCFullYear() &&
          lastActiveUtc.getUTCMonth() === yesterdayUtc.getUTCMonth() &&
          lastActiveUtc.getUTCDate() === yesterdayUtc.getUTCDate()
        ) {
          // Active yesterday (UTC), increment streak
          newStreak = existingStreak.current_streak + 1;
        } else {
          // Not active yesterday or today (UTC), reset streak
          newStreak = 1;
        }
      }
    }

    const { error: upsertError } = await supabase
      .from('streaks')
      .upsert({ user_id: userId, current_streak: newStreak, last_active_date: lastActiveDateToSave }, { onConflict: 'user_id' });

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