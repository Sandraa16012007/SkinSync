import { loadModels } from './modelLoader';

export const verifyIngredients = async (rawText) => {
  const { llm } = await loadModels();
  
  const prompt = `You are an INCI (International Nomenclature of Cosmetic Ingredients) expert.
I will give you a block of noisy OCR text from a product label.

CRITICAL INSTRUCTIONS:
1. IDENTIFY: Every legitimate chemical or botanical cosmetic ingredient.
2. STRIP: Proactively remove asterisks (*), and introductory words like "ingredients:" or "contains:" wherever they appear.
3. DISCARD: Non-ingredient fragments (e.g., 'hk:', 'TIC', 'HEN'), marketing slogans, brand names, and alphanumeric noise.
4. FORMAT: Return a simple comma-separated list.
5. QUALITY: If an item doesn't look like a real cosmetic chemical, EXCLUDE it.

RETURN ONLY THE CLEAN LIST. NO INTRO OR OUTRO.

INPUT TEXT:
"${rawText}"`;

  try {
    console.log('AI Verifier: Hardening OCR text into verified INCI list...');
    const response = await llm.generate({
      prompt: prompt,
      temperature: 0, 
    });

    const rawList = typeof response === 'string' ? response : (response.text || response.content || '');
    
    // Normalize: Lowercase, Split, Deduplicate, Clean
    const uniqueIngs = [...new Set(
      rawList.split(/[,;\n]/)
        .map(s => s.trim().toLowerCase().replace(/[*]/g, '').replace(/ingredients[:\-]?|contains[:\-]?/gi, '').trim())
        .filter(s => s.length > 2 && /[a-z]/.test(s)) // Must have letters and be reasonable length
    )];


    return uniqueIngs.join(', ');
  } catch (error) {
    console.warn('AI Verification failed, using fallback cleaning...');
    return rawText.toLowerCase().replace(/[®™©]/g, '').trim(); 
  }
};


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
1. RECONSTRUCT & CLEAN: Use your knowledge of INCI (International Nomenclature of Cosmetic Ingredients) to fix the noisy OCR text below. 
   - Transcribe fragments into full chemical names (e.g., 'Glycer' -> 'Glycerin').
   - Remove marketing fluff, trademark symbols, and non-ingredient noise.
   - EXCLUDE all administrative text: MRP, Net Wt, Mfg dates, addresses, licenses, prices, and warnings.
   - ONLY extract words that appear directly after "INGREDIENTS:" or similar headings. Ignore the rest.
2. MOLECULAR VERIFICATION: Cross-reference every identified ingredient against the user's ${skinType} skin and ${concerns}.
3. JSON EVALUATION: Return a strict JSON object with:
{
  "score": <0-100 based on clinical suitability>,
  "verdict": "<Safe | Mostly Safe | Use with Caution | Avoid>",
  "ingredients": [
    {
      "name": "<Chemical Name>",
      "benefit": "<Precise dermatological benefit for ${skinType}>",
      "warning": "<Why this risks triggering ${concerns} (if any)>",
      "risk": "<low | moderate | high>",
      "safety_status": "<Safe | Caution | Danger>"
    }
  ],
  "warnings": [
    {
      "ingredient": "<Name>",
      "message": "<Clinical explanation of risk for this user>",
      "severity": "<moderate | high>"
    }
  ],
  "explanation": "<Short, clinical summary of why this score was given, citing specific profile conflicts.>"
}

SCORING RUBRIC (STRICT VETO RULES):
- 100: Perfectly tailored for ${skinType} and actively addresses ${concerns}.
- 75-85: Generally safe, but contains mild irritants (fragrance, essential oils).
- 40-60: Contains ingredients that risk triggering ${concerns}. Capped at 60 if any 'Caution' status exists.
- <40: ABSOLUTE VETO. If ANY ingredient is in the 'Avoid' list or is 'High Risk' for ${skinType}, the score MUST be below 40.
- NO CANCELLATION: Safe ingredients do NOT increase the score if a dangerous ingredient is present.


Return RAW JSON only. No markdown. No conversational text.`;


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

/**
 * analyzes a full routine (multiple products) against profile
 */
export const generateRoutineReport = async (routineData, profile) => {
  const { llm } = await loadModels();

  const skinType = profile?.skinType || 'normal';
  const concerns = profile?.concerns?.join(', ') || 'None';
  
  // Format the morning and night product data for the prompt
  const formatList = (items) => items.map(p => 
    `- ${p.productName}: [Ingredients: ${p.ingredients?.join(', ') || 'None'}] (Current Safety: ${p.score}/100, Verdict: ${p.verdict})`
  ).join('\n');

  const morningList = formatList(routineData.morning);
  const nightList = formatList(routineData.night);

  const prompt = `You are a clinical dermatologist AI.
Your task is to analyze a Daily Skincare Routine (Morning & Night) for compatibility.

USER PROFILE:
- Skin Type: ${skinType}
- Specific Concerns: ${concerns}

ROUTINE:
MORNING:
${morningList || 'None'}

NIGHT:
${nightList || 'None'}

DIRECTIONS:
1. LAYER ANALYSIS: Check for conflicts in the same session (e.g. Mixing strong Vitamin C with copper peptides or high acids in the morning).
2. CUMULATIVE RISK: Check if the total routine is too aggressive (e.g. exfoliating in both morning and night).
3. SUITABILITY: Verify if the overall regime addresses ${concerns} without irritating ${skinType} skin.
4. INDIVIDUAL VETO: Heavily prioritize the results of the individual clinical analyses (Current Safety) already performed for each product.

RETURN a strict JSON object:
{
  "score": <0-100 total routine safety score>,
  "verdict": "<Safe | Mostly Safe | Use with Caution | Avoid>",
  "explanation": "<Short summary of why this score was given, highlighting any conflicts OR individual product risks.>",
  "tips": ["<Tip 1>", "<Tip 2>"]
}

SCORING RUBRIC (STRICT):
- 90-100: Balanced, safe for ${skinType}, and all individual products are 'Safe'.
- 70-85: Generally good but some minor optimization possible. No 'Danger' products allowed.
- 40-65: Active conflicts detected OR one product is 'Caution/Danger' (Score < 50).
- <40: ABSOLUTE VETO. If ANY product in the routine has an individual Safety score below 35, the overall routine score MUST NOT exceed 40.

Return RAW JSON only. No markdown.`;

  try {
    console.log('AI Routine Engine: Starting multi-product analysis...');
    const response = await llm.generate({
      prompt: prompt,
      temperature: 0.1
    });

    const rawText = typeof response === 'string' ? response : (response.text || response.content || '');
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Routine Analysis Error:', error);
    return {
      score: 50,
      verdict: "Unknown",
      explanation: "Full analysis could not be calculated. Please check individual product scores for safety.",
      tips: ["One or more products may have a low safety rating."]
    };
  }
};
