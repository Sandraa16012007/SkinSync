import { loadModels } from './modelLoader';

export const generateExplanation = async (data) => {
  const { profile, safe, risky, score } = data;
  const { llm } = await loadModels();

  const prompt = `You are a professional dermatologist.
Analyze the following skincare product compatibility for a patient with ${profile.skinType || 'normal'} skin.
Concerns: ${profile.concerns && profile.concerns.length ? profile.concerns.join(', ') : 'None'}.
Avoid List: ${profile.avoid && profile.avoid.length ? profile.avoid.join(', ') : 'None'}.
Compatibility Score: ${score}/100.
Safe Ingredients: ${safe.join(', ')}.
Risky/Flagged Ingredients: ${risky.length ? risky.join(', ') : 'None'}.

Provide a brief, professional explanation of this score and advice for the patient.
Keep the response strictly under 80 words. Do not use markdown styling.`;

  try {
    const response = await llm.generate({
      prompt: prompt,
      temperature: 0.3, // Professional and determined tone
      max_tokens: 100 // Hard limit roughly corresponding to 80 words
    });

    const explanation = typeof response === 'string' 
      ? response 
      : (response.text || response.content || '');

    return explanation.trim();
  } catch (error) {
    console.error('Failed to generate LLM explanation:', error);
    throw new Error('LLM generation failed');
  }
};
