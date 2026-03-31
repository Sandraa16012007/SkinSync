export const explanationPrompt = (data) => {
  const { profile, safe, risky, score } = data;

  const skinType = profile?.skinType || 'normal';
  const concerns = profile?.concerns?.length ? profile.concerns.join(', ') : 'None';
  const avoid = profile?.avoid?.length ? profile.avoid.join(', ') : 'None';

  const safeList = safe?.length ? safe.join(', ') : 'None';
  const riskyList = risky?.length ? risky.join(', ') : 'None';

  return `You are a professional dermatologist.
Analyze the following skincare product compatibility for a patient with ${skinType} skin.
Concerns: ${concerns}.
Avoid List: ${avoid}.

Product Analysis:
- Compatibility Score: ${score}/100
- Safe Ingredients: ${safeList}
- Risky/Flagged Ingredients: ${riskyList}

Based on this data, provide a brief, professional explanation of the score and give clear advice to the patient.
Keep the response strictly under 80 words. Do not use markdown styling.`;
};
