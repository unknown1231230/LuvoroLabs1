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
    const { data, error } = await supabase.rpc('update_user_streak', {
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    const newStreak = data;
    if (newStreak) {
      showSuccess(`Streak updated to ${newStreak} days!`);
    }
    return newStreak;
  } catch (error: any) {
    console.error(`Error in updateUserStreak for user ${userId}:`, error.message);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today in local time

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow in local time

    const { count, error } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today.toISOString())
      .lt('completed_at', tomorrow.toISOString());

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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today in local time

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow in local time

    const { count, error } = await supabase
      .from('user_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('attempted_at', today.toISOString())
      .lt('attempted_at', tomorrow.toISOString());

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

export const fetchUserQuizAttempts = async (userId: string, courseId: string, lessonId: string): Promise<Array<{ question_id: string; is_correct: boolean; selected_answer: string | null }>> => {
  try {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('question_id, is_correct, selected_answer')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId);

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error: any) {
    console.error("Error fetching user quiz attempts:", error.message);
    showError(`Failed to fetch quiz attempts: ${error.message}`);
    return [];
  }
};