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

// Helper to get the start of the week (Monday) for a given date
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0) to be last day of prev week
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const fetchWeeklyLessonCompletions = async (userId: string): Promise<{ name: string; lessons: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const weeklyData: Record<string, number> = {};
    const now = new Date();

    // Initialize data for the last 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = getStartOfWeek(new Date(now.setDate(now.getDate() - (i * 7))));
      const weekName = `Week ${4 - i}`; // Label as Week 1, Week 2, etc. from oldest to newest
      weeklyData[weekName] = 0;
    }

    // Reset now for iteration
    now.setDate(now.getDate() + (3 * 7));

    data.forEach(item => {
      const completedDate = new Date(item.completed_at);
      const weekStartOfCompletedDate = getStartOfWeek(completedDate);

      for (let i = 0; i < 4; i++) {
        const weekStart = getStartOfWeek(new Date(now.setDate(now.getDate() - (i * 7))));
        if (weekStartOfCompletedDate.getTime() === weekStart.getTime()) {
          const weekName = `Week ${4 - i}`;
          weeklyData[weekName]++;
          break;
        }
      }
      now.setDate(now.getDate() + (3 * 7)); // Reset now for next iteration
    });

    // Convert to array and sort by week number
    const result = Object.entries(weeklyData)
      .map(([name, lessons]) => ({ name, lessons }))
      .sort((a, b) => parseInt(a.name.replace('Week ', '')) - parseInt(b.name.replace('Week ', '')));

    return result;

  } catch (error: any) {
    console.error("Error fetching weekly lesson completions:", error.message);
    showError(`Failed to fetch weekly lesson completions: ${error.message}`);
    return [];
  }
};

export const fetchWeeklyQuizAttempts = async (userId: string): Promise<{ name: string; quizzes: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false });

    if (error) throw error;

    const weeklyData: Record<string, number> = {};
    const now = new Date();

    // Initialize data for the last 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = getStartOfWeek(new Date(now.setDate(now.getDate() - (i * 7))));
      const weekName = `Week ${4 - i}`;
      weeklyData[weekName] = 0;
    }

    // Reset now for iteration
    now.setDate(now.getDate() + (3 * 7));

    data.forEach(item => {
      const attemptedDate = new Date(item.attempted_at);
      const weekStartOfAttemptedDate = getStartOfWeek(attemptedDate);

      for (let i = 0; i < 4; i++) {
        const weekStart = getStartOfWeek(new Date(now.setDate(now.getDate() - (i * 7))));
        if (weekStartOfAttemptedDate.getTime() === weekStart.getTime()) {
          const weekName = `Week ${4 - i}`;
          weeklyData[weekName]++;
          break;
        }
      }
      now.setDate(now.getDate() + (3 * 7)); // Reset now for next iteration
    });

    const result = Object.entries(weeklyData)
      .map(([name, quizzes]) => ({ name, quizzes }))
      .sort((a, b) => parseInt(a.name.replace('Week ', '')) - parseInt(b.name.replace('Week ', '')));

    return result;

  } catch (error: any) {
    console.error("Error fetching weekly quiz attempts:", error.message);
    showError(`Failed to fetch weekly quiz attempts: ${error.message}`);
    return [];
  }
};