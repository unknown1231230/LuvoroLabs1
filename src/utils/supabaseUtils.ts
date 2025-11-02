import { supabase } from "@/lib/supabase";

export const incrementSiteMetric = async (metricName: string) => {
  try {
    const { data: currentMetric } = await supabase
      .from('site_metrics')
      .select('value')
      .eq('metric_name', metricName)
      .single();

    const newValue = (currentMetric?.value || 0) + 1;

    await supabase
      .from('site_metrics')
      .upsert({ metric_name: metricName, value: newValue }, { onConflict: 'metric_name' });
  } catch (error) {
    console.error(`Error incrementing site metric '${metricName}':`, error);
  }
};