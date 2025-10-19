import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.52.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAnswer, questionText, correctAnswer, explanation } = await req.json();

    if (!userAnswer || !questionText || !correctAnswer) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: userAnswer, questionText, correctAnswer' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize OpenAI client to use OpenRouter's API
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENROUTER_API_KEY"), // Use the new OpenRouter API key
      baseURL: "https://openrouter.ai/api/v1", // OpenRouter API endpoint
    });

    const prompt = `
      You are an expert physics tutor. Your task is to evaluate a student's free-response answer to a physics question.
      Compare the student's answer to the provided correct answer and explanation.
      Determine if the student's answer is fundamentally correct (even if not perfectly worded) and provide concise feedback.

      Question: "${questionText}"
      Correct Answer/Key Concepts: "${correctAnswer}"
      Explanation: "${explanation || 'No detailed explanation provided.'}"
      Student's Answer: "${userAnswer}"

      Based on the above, respond with a JSON object containing:
      1. "isCorrect": boolean (true if the student's answer is substantially correct, false otherwise)
      2. "feedback": string (a brief, helpful feedback message, e.g., "Correct!", "Partially correct, consider X.", "Incorrect, review Y.")
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can specify other models available on OpenRouter here, e.g., "mistralai/mixtral-8x7b-instruct"
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2, // Keep it low for factual grading
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content || '{}');

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error grading free response:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});