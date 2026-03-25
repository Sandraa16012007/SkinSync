import { loadModels } from './modelLoader';

export const generateCompatibilityReport = async (ingredients, profile) => {
  const { llm } = await loadModels();

  const skinType = profile?.skinType || 'normal';
  const concerns = profile?.concerns?.length ? profile.concerns.join(', ') : 'None';
  const avoid = profile?.avoid?.length ? profile.avoid.join(', ') : 'None';

  const prompt = `You are an expert dermatologist AI.
Analyze the skincare ingredients for a patient with ${skinType} skin.
Concerns: ${concerns}. Avoid List: ${avoid}.

Ingredients: ${ingredients.join(', ')}

Evaluate the compatibility specifically for this user's profile and return ONLY a valid JSON object matching exactly this structure:
{
  "score": <number 0-100>,
  "verdict": "<Safe | Mostly Safe | Use with Caution | Avoid>",
  "ingredients": [
    {
      "name": "<ingredient name>",
      "benefit": "<How this ingredient specifically interacts with this patient's ${skinType} skin and ${concerns}>",
      "risk": "<low | moderate | high>"
    }
  ],
  "warnings": [
    {
      "ingredient": "<ingredient name causing the warning, if any>",
      "message": "<Detailed warning explaining the specific risk for this user's ${skinType} skin or ${concerns}>",
      "severity": "<moderate | high>"
    }
  ],
  "conflicts": [
    {
      "pair": ["<ingredient 1>", "<ingredient 2>"],
      "warning": "<conflict explanation>"
    }
  ],
  "explanation": "<Short professional dermatologist summary setting the product's safety for this specific user.>"
}

CRITICAL: The 'benefit' field MUST NOT be a generic description. It must explain the effect on ${skinType} skin or how it helps/hurts with ${concerns}.
Example: Instead of "Humectant", use "Draws moisture to help with your dehydration".

Ensure all ingredients listed are included in the 'ingredients' array.
Focus on actual dermatological science. Penalize known irritants for sensitive/dry skin, or comedogenic ingredients for acne-prone skin. Bonus points for humectants/ceramides protecting barrier health.
DO NOT wrap the response in markdown blocks like \`\`\`json. Return raw JSON.`;

  try {
    const response = await llm.generate({
      prompt: prompt,
      temperature: 0.1,
      max_tokens: 1500
    });

    const rawText = typeof response === 'string' ? response : (response.text || response.content || '');
    
    // Clean up potential markdown formatting from LLM
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(jsonStr);

    // Map safe/risky derived arrays for backward compatibility in components
    const safe = parsedData.ingredients.filter(i => i.risk !== 'high').map(i => i.name);
    const risky = parsedData.ingredients.filter(i => i.risk === 'high' || i.risk === 'moderate').map(i => i.name);

    return {
      ...parsedData,
      safe,
      risky
    };

  } catch (error) {
    console.error('LLM JSON Generation Error:', error);
    // Fallback if LLM fails or replies with invalid JSON
    return {
      score: 50,
      verdict: "Unknown",
      ingredients: ingredients.map(name => ({ name, benefit: "Ingredient used in formulation", risk: "low" })),
      warnings: [{ ingredient: "System", message: "AI evaluation failed to parse properly.", severity: "high" }],
      conflicts: [],
      explanation: "We could not generate an AI response. Please try again.",
      safe: ingredients,
      risky: []
    };
  }
};

// Deprecated fallback for older integrations
export const generateExplanation = async () => "Deprecated";
