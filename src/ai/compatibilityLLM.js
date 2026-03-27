import { loadModels } from './modelLoader';

export const generateCompatibilityReport = async (rawIngredientsText, profile) => {
  const { llm } = await loadModels();

  const skinType = profile?.skinType || 'normal';
  const concerns = profile?.concerns?.length ? profile.concerns.join(', ') : 'None';
  const avoid = profile?.avoid?.length ? profile.avoid.join(', ') : 'None';

  const prompt = `You are a clinical dermatologist and cosmetic chemist AI.
Your task is to analyze skincare ingredients against a specific user profile.

USER PROFILE:
- Skin Type: ${skinType}
- Specific Concerns: ${concerns}
- Ingredients to Avoid: ${avoid}

INPUT TEXT (Potentially noisy OCR scan):
"${rawIngredientsText}"

DIRECTIONS:
1. RECONSTRUCT: Identify actual cosmetic ingredients in the NOISY TEXT. 
   - Discard symbols (®, ™, ©, •), brand names, and marketing claims.
   - Strip out non-alphabetic noise and bullet points.
   - Fix OCR typos (e.g., 'Watar' -> 'Water').
   - Result must be a list of recognizable chemical or botanical terms.
2. EVALUATE: Analyze these ingredients specifically for the user's ${skinType} skin and ${concerns}.
3. JSON RETURN: Return a valid JSON object matching this structure:
{
  "score": <number 0-100 indicating total compatibility>,
  "verdict": "<Safe | Mostly Safe | Use with Caution | Avoid>",
  "ingredients": [
    {
      "name": "<ingredient name>",
      "benefit": "<Precise explanation of how this chemical behaves for ${skinType} skin and ${concerns}>",
      "warning": "<If risk is moderate/high, explain the specific anatomical risk for ${skinType} + ${concerns}. Else null>",
      "risk": "<low | moderate | high>"
    }
  ],

  "warnings": [
    {
      "ingredient": "<Name>",
      "message": "<Explanation of why this is problematic for THIS SPECIFIC USER'S skin type or concerns>",
      "severity": "<moderate | high>"
    }
  ],
  "conflicts": [
    {
      "pair": ["<ing1>", "<ing2>"],
      "warning": "<Why these two interact poorly or cause irritation together>"
    }
  ],
  "explanation": "<Short, punchy summary of the product's overall suitablity. Mention if the product is a good match for ${concerns} or if it risks triggering ${skinType} issues.>"
}

CONSTRAINTS:
1. Every ingredient must have a 'benefit' tailored to the user profile. No generic descriptions.
2. If an ingredient is in the 'Avoid' list, the verdict should be 'Avoid' or 'Use with Caution'.
3. Penalize heavily for alcohols in dry skin or high comedogenicity in acne-prone skin.
4. Return ONLY raw JSON. No markdown blocks.`;

  try {
    console.log('AI Engine: Triggering LLM analysis for', rawIngredientsText.length, 'characters of input text...');
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
    const fallbackList = typeof rawIngredientsText === 'string' 
      ? rawIngredientsText.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 2)
      : [];
      
    return {
      score: 50,
      verdict: "Unknown",
      ingredients: fallbackList.map(name => ({ name, benefit: "Ingredient detected in scan", risk: "low" })),
      warnings: [{ ingredient: "System", message: "AI evaluation failed to parse properly.", severity: "high" }],
      conflicts: [],
      explanation: "We could not generate a valid AI response. Using local fallback parsing.",
      safe: fallbackList,
      risky: []
    };
  }
};


// Deprecated fallback for older integrations
export const generateExplanation = async () => "Deprecated";
