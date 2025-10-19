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

export const fetchDailyLessonCompletions = async (userId: string): Promise<{ name: string; lessons: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const dailyData: Record<string, number> = {};
    const dayStarts: Date[] = [];
    const now = new Date(); // Get current date/time (local)
    const startOfTodayUTC = getStartOfDayUTC(now); // Calculate start of current day in UTC

    // Generate the start dates for the last 7 days (including today) in UTC
    for (let i = 0; i < 7; i++) {
      const dayStartDate = new Date(startOfTodayUTC);
      dayStartDate.setUTCDate(startOfTodayUTC.getUTCDate() - (6 - i)); // Go back 6, 5, ..., 0 days
      dayStarts.push(dayStartDate);
    }

    const dayLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"];
    dayStarts.forEach((_, index) => {
      dailyData[dayLabels[index]] = 0;
    });

    data.forEach(item => {
      const completedDate = new Date(item.completed_at); // This is already UTC from Supabase
      const startOfCompletedDate = getStartOfDayUTC(completedDate);

      for (let i = 0; i < dayStarts.length; i++) {
        if (startOfCompletedDate.getTime() === dayStarts[i].getTime()) {
          dailyData[dayLabels[i]]++;
          break;
        }
      }
    });

    const result = Object.entries(dailyData)
      .map(([name, lessons]) => ({ name, lessons }))
      .sort((a, b) => {
        // Custom sort to ensure "Today" is always last
        if (a.name === "Today") return 1;
        if (b.name === "Today") return -1;
        // For "Day X" labels, sort numerically
        const numA = parseInt(a.name.replace('Day ', ''));
        const numB = parseInt(b.name.replace('Day ', ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return 0; // Fallback if names are not "Day X"
      });

    return result;

  } catch (error: any) {
    console.error("Error fetching daily lesson completions:", error.message);
    showError(`Failed to fetch daily lesson completions: ${error.message}`);
    return [];
  }
};

export const fetchDailyQuizAttempts = async (userId: string): Promise<{ name: string; quizzes: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false });

    if (error) throw error;

    const dailyData: Record<string, number> = {};
    const dayStarts: Date[] = [];
    const now = new Date(); // Get current date/time (local)
    const startOfTodayUTC = getStartOfDayUTC(now); // Calculate start of current day in UTC

    // Generate the start dates for the last 7 days (including today) in UTC
    for (let i = 0; i < 7; i++) {
      const dayStartDate = new Date(startOfTodayUTC);
      dayStartDate.setUTCDate(startOfTodayUTC.getUTCDate() - (6 - i)); // Go back 6, 5, ..., 0 days
      dayStarts.push(dayStartDate);
    }

    const dayLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"];
    dayStarts.forEach((_, index) => {
      dailyData[dayLabels[index]] = 0;
    });

    data.forEach(item => {
      const attemptedDate = new Date(item.attempted_at); // This is already UTC from Supabase
      const startOfAttemptedDate = getStartOfDayUTC(attemptedDate);

      for (let i = 0; i < dayStarts.length; i++) {
        if (startOfAttemptedDate.getTime() === dayStarts[i].getTime()) {
          dailyData[dayLabels[i]]++;
          break;
        }
      }
    });

    const result = Object.entries(dailyData)
      .map(([name, quizzes]) => ({ name, quizzes }))
      .sort((a, b) => {
        // Custom sort to ensure "Today" is always last
        if (a.name === "Today") return 1;
        if (b.name === "Today") return -1;
        // For "Day X" labels, sort numerically
        const numA = parseInt(a.name.replace('Day ', ''));
        const numB = parseInt(b.name.replace('Day ', ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return 0; // Fallback if names are not "Day X"
      });

    return result;

  } catch (error: any) {
    console.error("Error fetching daily quiz attempts:", error.message);
    showError(`Failed to fetch daily quiz attempts: ${error.message}`);
    return [];
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