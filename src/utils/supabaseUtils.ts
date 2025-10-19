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

export const fetchUserLessonProgress = async (userId: string, courseId?: string): Promise<string[]> => {
  try {
    let query = supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

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

export const fetchUserCompletedLessonsCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return count || 0;
  } catch (error: any) {
    console.error("Error fetching user completed lessons count:", error.message);
    showError(`Failed to fetch completed lessons count: ${error.message}`);
    return 0;
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
    let lastActiveDateToSave = todayUtc.toISOString().split('T')[0]; // Save only the date part (YYYY-MM-DD)

    if (existingStreak) {
      const lastActiveDateFromDB = existingStreak.last_active_date; // e.g., "2023-10-27"
      let lastActiveUtc: Date;

      if (lastActiveDateFromDB && typeof lastActiveDateFromDB === 'string') {
        // Explicitly parse the date string as UTC to avoid local timezone issues
        // Append 'T00:00:00Z' to ensure it's treated as UTC midnight
        lastActiveUtc = new Date(lastActiveDateFromDB + 'T00:00:00Z');
      } else {
        lastActiveUtc = new Date(0); // Fallback to a very old date
      }

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

export const fetchSiteMetric = async (metricName: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_metrics')
      .select('value')
      .eq('metric_name', metricName)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }
    return data?.value || 0;
  } catch (error: any) {
    console.error(`Error fetching site metric '${metricName}':`, error.message);
    return 0;
  }
};

export const incrementSiteMetric = async (metricName: string, incrementBy: number = 1) => {
  try {
    // Fetch current value
    const { data: currentMetric, error: fetchError } = await supabase
      .from('site_metrics')
      .select('value')
      .eq('metric_name', metricName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const newValue = (currentMetric?.value || 0) + incrementBy;

    const { error: updateError } = await supabase
      .from('site_metrics')
      .upsert({ metric_name: metricName, value: newValue, updated_at: new Date().toISOString() }, { onConflict: 'metric_name' });

    if (updateError) {
      throw updateError;
    }
    console.log(`Site metric '${metricName}' incremented to ${newValue}`);
    return newValue;
  } catch (error: any) {
    console.error(`Error incrementing site metric '${metricName}':`, error.message);
    showError(`Failed to update site metric: ${error.message}`);
    return null;
  }
};

// Helper to get the start of the day in UTC for a given date
const getStartOfDayUTC = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMilliseconds(0);
  return d;
};

export const fetchLessonsCompletedToday = async (userId: string): Promise<number> => {
  try {
    const todayUtc = getStartOfDayUTC(new Date());
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(todayUtc.getUTCDate() + 1);

    const { count, error } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', todayUtc.toISOString())
      .lt('completed_at', tomorrowUtc.toISOString());

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error("Error fetching lessons completed today:", error.message);
    showError(`Failed to fetch lessons completed today: ${error.message}`);
    return 0;
  }
};

export const fetchTotalQuizAttempts = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error("Error fetching total quiz attempts:", error.message);
    showError(`Failed to fetch total quiz attempts: ${error.message}`);
    return 0;
  }
};

export const fetchQuizzesTakenToday = async (userId: string): Promise<number> => {
  try {
    const todayUtc = getStartOfDayUTC(new Date());
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(todayUtc.getUTCDate() + 1);

    const { count, error } = await supabase
      .from('user_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('attempted_at', todayUtc.toISOString())
      .lt('attempted_at', tomorrowUtc.toISOString());

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error("Error fetching quizzes taken today:", error.message);
    showError(`Failed to fetch quizzes taken today: ${error.message}`);
    return 0;
  }
};

export const fetchStreakHistory = async (userId: string): Promise<{ recorded_date: string; streak_count: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('streak_history')
      .select('recorded_date, streak_count')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error: any) {
    console.error("Error fetching streak history:", error.message);
    showError(`Failed to fetch streak history: ${error.message}`);
    return [];
  }
};