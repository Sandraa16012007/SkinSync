import { ingredientDB } from '../services/ingredientKnowledgeBase';

export const calculateCompatibility = (ingredients, profile) => {
  let score = 100;
  const safe = [];
  const risky = [];

  const avoidList = profile.avoid ? profile.avoid.map(a => a.toLowerCase().trim()) : [];
  const concerns = profile.concerns ? profile.concerns.map(c => c.toLowerCase().trim()) : [];
  const skinType = profile.skinType ? profile.skinType.toLowerCase().trim() : 'normal';

  for (const rawName of ingredients) {
    const name = rawName.toLowerCase().trim();
    if (!name) continue;

    let isRisky = false;
    let penalty = 0;

    const data = ingredientDB[name];

    // Direct Avoid List match
    if (avoidList.includes(name)) {
      isRisky = true;
      penalty += 20;
    }

    if (data) {
      // High irritation checking
      if (data.irritation > 4) {
        isRisky = true;
        penalty += data.irritation * 2;
      }
      
      // Sensitivity profile extra checking
      if (concerns.includes('sensitivity') && data.irritation >= 3) {
        isRisky = true;
        penalty += data.irritation * 3;
      }

      // Acne trigger checking
      if (concerns.includes('acne') && data.acne_safe === false) {
        isRisky = true;
        penalty += 15;
      }

      // Heavy moisturizers on oily skin
      if (skinType === 'oily' && data.hydration > 8 && data.oil_control <= 2) {
        penalty += 5;
      }

      // Strong oil control on dry skin
      if (skinType === 'dry' && data.oil_control > 7 && data.hydration <= 2) {
        isRisky = true;
        penalty += 10;
      }
    }

    if (isRisky || penalty >= 10) {
      risky.push(name);
      // Let's cap penalty so one ingredient doesn't completely tank the score
      score -= Math.min(penalty, 30);
    } else {
      safe.push(name);
      score -= Math.min(penalty, 5); // Minor penalty for safe stuff if any
    }
  }

  // Ensure score is bounded between 0 and 100
  score = Math.max(0, Math.round(score));

  return {
    score,
    safe,
    risky
  };
};
