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

// Helper to get the start of the day in LOCAL timezone for a given date
const getStartOfDayLocal = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Sets local hours to midnight
  d.setMilliseconds(0);
  return d;
};

export const updateUserStreak = async (userId: string) => {
  try {
    const { data: existingStreak, error: fetchError } = await supabase
      .from('streaks')
      .select('current_streak, last_active_date') // Only select necessary columns
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("[Streak Debug] Error fetching existing streak:", fetchError.message);
      throw fetchError;
    }

    const todayLocal = getStartOfDayLocal(new Date()); // Midnight of client's local day
    let newStreak = 1;
    // Format for DB: YYYY-MM-DD
    const todayFormatted = todayLocal.toISOString().split('T')[0];

    console.log(`[Streak Debug] Current time: ${new Date().toISOString()}`);
    console.log(`[Streak Debug] todayLocal: ${todayLocal.toISOString()}`);
    console.log(`[Streak Debug] todayFormatted (for DB): ${todayFormatted}`);

    if (existingStreak) {
      console.log(`[Streak Debug] Existing streak: ${existingStreak.current_streak}, last active date (DB): ${existingStreak.last_active_date}`);
      const lastActiveDateFromDB = existingStreak.last_active_date; // This is 'YYYY-MM-DD' string
      // Parse DB date string as a local date at midnight for comparison
      const lastActiveLocal = getStartOfDayLocal(new Date(lastActiveDateFromDB));
      console.log(`[Streak Debug] lastActiveLocal (from DB): ${lastActiveLocal.toISOString()}`);

      const yesterdayLocal = getStartOfDayLocal(new Date(todayLocal));
      yesterdayLocal.setDate(todayLocal.getDate() - 1);
      console.log(`[Streak Debug] yesterdayLocal: ${yesterdayLocal.toISOString()}`);

      console.log(`[Streak Debug] Comparison: lastActiveLocal (${lastActiveLocal.toISOString()}) === todayLocal (${todayLocal.toISOString()}) -> ${lastActiveLocal.getTime() === todayLocal.getTime()}`);
      console.log(`[Streak Debug] Comparison: lastActiveLocal (${lastActiveLocal.toISOString()}) === yesterdayLocal (${yesterdayLocal.toISOString()}) -> ${lastActiveLocal.getTime() === yesterdayLocal.getTime()}`);


      // Check if the last active date is today (local)
      if (lastActiveLocal.getTime() === todayLocal.getTime()) {
        newStreak = existingStreak.current_streak;
        console.log(`[Streak Debug] User ${userId}: Same local day (${todayFormatted}), streak not changed. Current: ${newStreak}`);
      } else {
        // Check if the last active date was yesterday (local)
        if (lastActiveLocal.getTime() === yesterdayLocal.getTime()) {
          newStreak = existingStreak.current_streak + 1;
          console.log(`[Streak Debug] User ${userId}: Consecutive local day (${todayFormatted}), streak incremented. New: ${newStreak}`);
        } else {
          // Not active yesterday or today (local), reset streak
          newStreak = 1;
          console.log(`[Streak Debug] User ${userId}: Gap detected (last active: ${lastActiveDateFromDB}), streak reset. New: ${newStreak}`);
        }
      }
    } else {
      console.log(`[Streak Debug] User ${userId}: First activity, starting streak at 1.`);
    }

    const { error: upsertError } = await supabase
      .from('streaks')
      .upsert({ user_id: userId, current_streak: newStreak, last_active_date: todayFormatted }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error(`[Streak Debug] Error upserting streak for user ${userId}:`, upsertError.message);
      throw upsertError;
    }

    showSuccess(`Streak updated to ${newStreak} days!`);
    return newStreak;
  } catch (error: any) {
    console.error(`[Streak Debug] Unhandled error in updateUserStreak for user ${userId}:`, error.message);
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


export const fetchLessonsCompletedToday = async (userId: string): Promise<number> => {
  try {
    const todayLocal = getStartOfDayLocal(new Date());
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const { count, error } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', todayLocal.toISOString())
      .lt('completed_at', tomorrowLocal.toISOString());

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
    const todayLocal = getStartOfDayLocal(new Date());
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const { count, error } = await supabase
      .from('user_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('attempted_at', todayLocal.toISOString())
      .lt('attempted_at', tomorrowLocal.toISOString());

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